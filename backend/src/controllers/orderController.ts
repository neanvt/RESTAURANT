import { Request, Response } from "express";
import { Types } from "mongoose";
import Order from "../models/Order";
import KOT from "../models/KOT";
import Item from "../models/Item";
import Counter from "../models/Counter";
import staffService from "../services/staffService";

// Generate order number - Format: 015/25-26
const generateOrderNumber = async (outletId: string): Promise<string> => {
  // Get current date in local timezone
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`; // YYYY-MM-DD in local time

  const counterId = `order_${outletId}_${dateStr}`;

  try {
    console.log(
      `🔄 Generating order number for outlet ${outletId} on ${dateStr}`
    );

    // Get outlet to fetch financial year
    const outlet = await require("../models/Outlet").default.findById(outletId);
    const financialYear = outlet?.settings?.financialYearStart || "26-27";

    // Use findOneAndUpdate with upsert to atomically increment the counter
    const counter = await Counter.findOneAndUpdate(
      { _id: counterId },
      {
        $inc: { sequence: 1 },
        $setOnInsert: { date: new Date(`${dateStr}T00:00:00.000Z`) },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!counter) {
      throw new Error("Failed to generate counter");
    }

    // Format: 015/25-26
    const formattedNumber = `${counter.sequence
      .toString()
      .padStart(3, "0")}/${financialYear}`;

    console.log(
      `✅ Generated order number: ${formattedNumber} for outlet ${outletId}`
    );
    return formattedNumber;
  } catch (error: any) {
    console.error(`❌ Error generating order number:`, error);
    console.error("Counter model available:", !!Counter);
    throw new Error(`Failed to generate order number: ${error.message}`);
  }
};

// Generate KOT number - Simple format: 001, 002, etc.
const generateKOTNumber = async (outletId: string): Promise<string> => {
  // Get current date in local timezone
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`; // YYYY-MM-DD in local time

  const counterId = `kot_${outletId}_${dateStr}`;

  try {
    console.log(
      `🔄 Generating KOT number for outlet ${outletId} on ${dateStr}`
    );

    // Use findOneAndUpdate with upsert to atomically increment the counter
    const counter = await Counter.findOneAndUpdate(
      { _id: counterId },
      {
        $inc: { sequence: 1 },
        $setOnInsert: { date: new Date(`${dateStr}T00:00:00.000Z`) },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!counter) {
      throw new Error("Failed to generate KOT counter");
    }

    // Simple format: 001, 002, 003, etc.
    const formattedNumber = counter.sequence.toString().padStart(3, "0");

    console.log(`✅ Generated KOT number: ${formattedNumber}`);
    return formattedNumber;
  } catch (error: any) {
    console.error(`❌ Error generating KOT number:`, error);
    throw new Error(`Failed to generate KOT number: ${error.message}`);
  }
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

    // Generate order number and create order with retry logic for duplicate key errors
    let order;
    let orderNumber: string = "";
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        orderNumber = await generateOrderNumber(outletId.toString());

        order = await Order.create({
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

        break; // Success, exit loop
      } catch (error: any) {
        lastError = error;

        // Check if it's a duplicate key error
        if (error.code === 11000 && error.message.includes("orderNumber")) {
          retries--;
          console.log(
            `Duplicate order number detected, retrying... (${retries} attempts left)`
          );

          if (retries > 0) {
            // Wait a bit before retrying (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, 100 * (4 - retries))
            );
            continue;
          }
        }

        // If not a duplicate error or out of retries, throw
        throw error;
      }
    }

    if (!order) {
      throw lastError || new Error("Failed to create order after retries");
    }

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
    console.error("❌ Order creation error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      error: {
        message: error.message || "Failed to create order",
        code: error.code,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
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

    if (order.status !== "draft" && order.status !== "kot_generated") {
      res.status(400).json({
        success: false,
        error: {
          message:
            "KOT can only be generated for draft or kot_generated orders",
        },
      });
      return;
    }

    // Generate KOT number and create KOT with retry logic
    let kot;
    let kotNumber: string = "";
    let kotRetries = 3;
    let lastKotError;

    while (kotRetries > 0) {
      try {
        kotNumber = await generateKOTNumber(outletId.toString());

        kot = await KOT.create({
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

        break; // Success
      } catch (error: any) {
        lastKotError = error;

        if (error.code === 11000 && error.message.includes("kotNumber")) {
          kotRetries--;
          console.log(`Duplicate KOT number, retrying... (${kotRetries} left)`);

          if (kotRetries > 0) {
            await new Promise((resolve) =>
              setTimeout(resolve, 100 * (4 - kotRetries))
            );
            continue;
          }
        }

        throw error;
      }
    }

    if (!kot) {
      throw lastKotError || new Error("Failed to create KOT after retries");
    }

    // Update order status to kot_generated (don't complete it yet)
    order.status = "kot_generated";
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
      data: { order, kot },
    });
  } catch (error: any) {
    console.error("❌ KOT generation error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      error: {
        message: error.message || "Failed to generate KOT",
        code: error.code,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
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
