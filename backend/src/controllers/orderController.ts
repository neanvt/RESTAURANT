import { Request, Response } from "express";
import { Types } from "mongoose";
import Order from "../models/Order";
import KOT from "../models/KOT";
import Invoice from "../models/Invoice";
import Item from "../models/Item";
import staffService from "../services/staffService";

// Generate order number - just returns daily sequence number
const generateOrderNumber = async (outletId: string): Promise<string> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const lastOrder = await Order.findOne({
    outletId,
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
  }).sort({ createdAt: -1 });

  let sequence = 1;
  if (lastOrder && lastOrder.orderNumber) {
    const lastSequence = parseInt(lastOrder.orderNumber) || 0;
    sequence = lastSequence + 1;
  }

  return sequence.toString();
};

// Generate KOT number - just returns daily sequence number
const generateKOTNumber = async (outletId: string): Promise<string> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const lastKOT = await KOT.findOne({
    outletId,
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
  }).sort({ createdAt: -1 });

  let sequence = 1;
  if (lastKOT && lastKOT.kotNumber) {
    const lastSequence = parseInt(lastKOT.kotNumber) || 0;
    sequence = lastSequence + 1;
  }

  return sequence.toString();
};

// Generate Invoice number - just returns daily sequence number
const generateInvoiceNumber = async (outletId: string): Promise<string> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const lastInvoice = await Invoice.findOne({
    outletId,
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
  }).sort({ createdAt: -1 });

  let sequence = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const lastSequence = parseInt(lastInvoice.invoiceNumber) || 0;
    sequence = lastSequence + 1;
  }

  return sequence.toString();
};

// Calculate order totals
const calculateOrderTotals = (items: any[]) => {
  let subtotal = 0;
  let taxAmount = 0;

  const calculatedItems = items.map((item) => {
    const itemSubtotal = item.price * item.quantity;
    const itemTaxAmount = item.tax ? (itemSubtotal * item.tax.rate) / 100 : 0;
    const itemTotal = itemSubtotal + itemTaxAmount;

    subtotal += itemSubtotal;
    taxAmount += itemTaxAmount;

    return {
      ...item,
      subtotal: itemSubtotal,
      tax: item.tax ? { ...item.tax, amount: itemTaxAmount } : undefined,
      total: itemTotal,
    };
  });

  return {
    items: calculatedItems,
    subtotal,
    taxAmount,
    total: subtotal + taxAmount,
  };
};

// Create new order
export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { items, customer, tableNumber, notes } = req.body;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    if (!items || items.length === 0) {
      res.status(400).json({
        success: false,
        error: { message: "At least one item is required" },
      });
      return;
    }

    // Fetch item details and validate
    const itemIds = items.map((item: any) => item.item);
    const dbItems = await Item.find({
      _id: { $in: itemIds },
      outletId,
      isActive: true,
    });

    if (dbItems.length !== itemIds.length) {
      res.status(400).json({
        success: false,
        error: { message: "One or more items are invalid or inactive" },
      });
      return;
    }

    // Build order items with item details
    const orderItems = items.map((orderItem: any) => {
      const dbItem = dbItems.find(
        (item: any) => item._id.toString() === orderItem.item
      );
      if (!dbItem) throw new Error("Item not found");

      return {
        item: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: orderItem.quantity,
        tax: dbItem.tax?.isApplicable
          ? {
              rate: dbItem.tax.rate,
              amount: 0, // Will be calculated
            }
          : undefined,
        notes: orderItem.notes,
        subtotal: 0, // Will be calculated
        total: 0, // Will be calculated
      };
    });

    // Calculate totals
    const {
      items: calculatedItems,
      subtotal,
      taxAmount,
      total,
    } = calculateOrderTotals(orderItems);

    // Generate order number
    const orderNumber = await generateOrderNumber(outletId.toString());

    // Create order
    const order = await Order.create({
      outletId,
      orderNumber,
      items: calculatedItems,
      subtotal,
      taxAmount,
      total,
      status: "draft",
      customer,
      tableNumber,
      notes,
      createdBy: req.user!.userId,
    });

    // Log activity
    await staffService.logActivity({
      userId: req.user!.userId,
      outletId: outletId.toString(),
      action: `Created order #${orderNumber}`,
      actionType: "order_created",
      metadata: { orderId: order._id, orderNumber, total },
      ipAddress: req.ip || "unknown",
      userAgent: req.get("user-agent"),
    });

    // Send push notification
    try {
      const notificationService = (
        await import("../services/notificationService")
      ).default;
      await notificationService.sendToOutlet(
        outletId.toString(),
        "new_orders",
        {
          title: "New Order",
          body: `Order #${orderNumber} received - ₹${total.toFixed(2)}`,
          icon: "/icon-192x192.png",
          data: {
            orderId: (order._id as any).toString(),
            orderNumber,
            type: "new_order",
          },
        }
      );
    } catch (error) {
      // Don't fail order creation if notification fails
      console.log("Failed to send notification:", error);
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to create order" },
    });
  }
};

// Get all orders
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }
    const { status, paymentStatus, search, startDate, endDate } = req.query;

    const filter: any = { outletId };

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } },
      ];
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const orders = await Order.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch orders" },
    });
  }
};

// Get single order
export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const order = await Order.findOne({ _id: id, outletId })
      .populate("createdBy", "name email")
      .populate("kotId");

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: "Order not found" },
      });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch order" },
    });
  }
};

// Update order
export const updateOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { items, customer, tableNumber, notes } = req.body;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const order = await Order.findOne({ _id: id, outletId });

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: "Order not found" },
      });
      return;
    }

    if (order.status !== "draft") {
      res.status(400).json({
        success: false,
        error: { message: "Only draft orders can be updated" },
      });
      return;
    }

    // Update items if provided
    if (items && items.length > 0) {
      const itemIds = items.map((item: any) => item.item);
      const dbItems = await Item.find({
        _id: { $in: itemIds },
        outletId,
        isActive: true,
      });

      const orderItems = items.map((orderItem: any) => {
        const dbItem = dbItems.find(
          (item: any) => item._id.toString() === orderItem.item
        );
        if (!dbItem) throw new Error("Item not found");

        return {
          item: dbItem._id,
          name: dbItem.name,
          price: dbItem.price,
          quantity: orderItem.quantity,
          tax: dbItem.tax?.isApplicable
            ? {
                rate: dbItem.tax.rate,
                amount: 0,
              }
            : undefined,
          notes: orderItem.notes,
          subtotal: 0,
          total: 0,
        };
      });

      const {
        items: calculatedItems,
        subtotal,
        taxAmount,
        total,
      } = calculateOrderTotals(orderItems);

      order.items = calculatedItems;
      order.subtotal = subtotal;
      order.taxAmount = taxAmount;
      order.total = total;
    }

    if (customer) order.customer = customer;
    if (tableNumber !== undefined) order.tableNumber = tableNumber;
    if (notes !== undefined) order.notes = notes;

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to update order" },
    });
  }
};

// Generate KOT for order
export const generateKOT = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const order = await Order.findOne({ _id: id, outletId });

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: "Order not found" },
      });
      return;
    }

    if (order.status !== "draft") {
      res.status(400).json({
        success: false,
        error: { message: "KOT can only be generated for draft orders" },
      });
      return;
    }

    // Generate KOT number
    const kotNumber = await generateKOTNumber(outletId.toString());

    // Create KOT
    const kot = await KOT.create({
      outletId,
      orderId: order._id,
      kotNumber,
      items: order.items.map((item) => ({
        item: item.item,
        name: item.name,
        quantity: item.quantity,
        notes: item.notes,
        status: "pending",
      })),
      status: "pending",
      tableNumber: order.tableNumber,
      notes: order.notes,
      createdBy: req.user!.userId,
    });

    // Generate Invoice number
    const invoiceNumber = await generateInvoiceNumber(outletId.toString());

    // Create Invoice
    const invoice = await Invoice.create({
      outletId,
      orderId: order._id,
      invoiceNumber,
      items: order.items,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      total: order.total,
      customer: order.customer,
      paymentMethod: "cash", // Default payment method
      paymentStatus: "pending",
      paidAmount: 0,
      notes: order.notes,
      createdBy: req.user!.userId,
    });

    // Update order status to completed
    order.status = "completed";
    order.kotId = kot._id as Types.ObjectId;
    await order.save();

    // Log activity
    await staffService.logActivity({
      userId: req.user!.userId,
      outletId: outletId.toString(),
      action: `Generated KOT #${kotNumber} for order #${order.orderNumber}`,
      actionType: "kot_generated",
      metadata: { orderId: order._id, kotId: kot._id, kotNumber },
      ipAddress: req.ip || "unknown",
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      data: { order, kot, invoice },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to generate KOT" },
    });
  }
};

// Hold order
export const holdOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const order = await Order.findOne({ _id: id, outletId });

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: "Order not found" },
      });
      return;
    }

    if (order.status !== "draft" && order.status !== "kot_generated") {
      res.status(400).json({
        success: false,
        error: { message: "Only draft or KOT generated orders can be held" },
      });
      return;
    }

    order.status = "on_hold";
    await order.save();

    // Log activity
    await staffService.logActivity({
      userId: req.user!.userId,
      outletId: outletId.toString(),
      action: `Put order #${order.orderNumber} on hold`,
      actionType: "order_updated",
      metadata: { orderId: order._id, status: "on_hold" },
      ipAddress: req.ip || "unknown",
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to hold order" },
    });
  }
};

// Resume order
export const resumeOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const order = await Order.findOne({ _id: id, outletId });

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: "Order not found" },
      });
      return;
    }

    if (order.status !== "on_hold") {
      res.status(400).json({
        success: false,
        error: { message: "Only held orders can be resumed" },
      });
      return;
    }

    // Resume to previous status
    order.status = order.kotId ? "kot_generated" : "draft";
    await order.save();

    // Log activity
    await staffService.logActivity({
      userId: req.user!.userId,
      outletId: outletId.toString(),
      action: `Resumed order #${order.orderNumber}`,
      actionType: "order_updated",
      metadata: { orderId: order._id, status: order.status },
      ipAddress: req.ip || "unknown",
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to resume order" },
    });
  }
};

// Cancel order
export const cancelOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const order = await Order.findOne({ _id: id, outletId });

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: "Order not found" },
      });
      return;
    }

    if (order.status === "completed" || order.status === "cancelled") {
      res.status(400).json({
        success: false,
        error: { message: "Order is already completed or cancelled" },
      });
      return;
    }

    order.status = "cancelled";
    await order.save();

    // Log activity
    await staffService.logActivity({
      userId: req.user!.userId,
      outletId: outletId.toString(),
      action: `Cancelled order #${order.orderNumber}`,
      actionType: "order_updated",
      metadata: { orderId: order._id, status: "cancelled" },
      ipAddress: req.ip || "unknown",
      userAgent: req.get("user-agent"),
    });

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to cancel order" },
    });
  }
};

// Delete order
export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const order = await Order.findOne({ _id: id, outletId });

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: "Order not found" },
      });
      return;
    }

    if (order.status !== "draft" && order.status !== "on_hold") {
      res.status(400).json({
        success: false,
        error: { message: "Only draft or on-hold orders can be deleted" },
      });
      return;
    }

    await order.deleteOne();

    res.json({
      success: true,
      data: { message: "Order deleted successfully" },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to delete order" },
    });
  }
};
