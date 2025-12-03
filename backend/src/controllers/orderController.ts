import { Request, Response } from "express";
import { Types } from "mongoose";
import Order from "../models/Order";
import KOT from "../models/KOT";
import Item from "../models/Item";
import Counter from "../models/Counter";
import staffService from "../services/staffService";

// Generate order number - Format: 001/25-26 (resets annually on April 1st)
const generateOrderNumber = async (outletId: string): Promise<string> => {
  // Get current date in local timezone
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 1-12

  // Calculate financial year (April 1st to March 31st)
  // If current month is Jan-Mar, financial year started last year
  const financialYearStart = month < 4 ? year - 1 : year;
  const financialYearEnd = financialYearStart + 1;

  // Counter ID based on financial year (resets annually)
  const counterId = `order_${outletId}_FY${financialYearStart}-${financialYearEnd}`;
  const financialYearDate = new Date(
    `${financialYearStart}-04-01T00:00:00.000Z`
  );

  try {
    console.log(
      `🔄 Generating order number for outlet ${outletId} (FY: ${financialYearStart}-${financialYearEnd})`
    );

    // Format financial year as YY-YY (e.g., 25-26 for 2025-2026)
    const fyStartShort = financialYearStart.toString().slice(-2);
    const fyEndShort = financialYearEnd.toString().slice(-2);
    const financialYear = `${fyStartShort}-${fyEndShort}`;

    // Use findOneAndUpdate with upsert to atomically increment the counter
    // IMPORTANT: The counter is tied to the financial year to reset annually
    const counter = await Counter.findOneAndUpdate(
      { _id: counterId },
      {
        $inc: { sequence: 1 },
        $setOnInsert: {
          date: financialYearDate,
          type: "order",
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    // Validate that the counter is for the correct financial year
    if (counter && counter.date) {
      const counterYear = counter.date.getFullYear();
      if (counterYear !== financialYearStart) {
        throw new Error(
          `Counter year mismatch: expected FY${financialYearStart}, got FY${counterYear}`
        );
      }
    }

    if (!counter) {
      throw new Error("Failed to generate counter");
    }

    // Format: 001/25-26, 002/25-26, etc. (simple sequential with financial year)
    // Note: Counter resets annually on April 1st
    const formattedNumber = `${counter.sequence
      .toString()
      .padStart(3, "0")}/${financialYear}`;

    console.log(
      `✅ Generated order number: ${formattedNumber} for outlet ${outletId} (FY: ${financialYear}, sequence: ${counter.sequence})`
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
  const todayDate = new Date(`${dateStr}T00:00:00.000Z`);

  try {
    console.log(
      `🔄 Generating KOT number for outlet ${outletId} on ${dateStr}`
    );

    // Use findOneAndUpdate with upsert to atomically increment the counter
    // IMPORTANT: The counter is tied to the specific date to prevent conflicts
    const counter = await Counter.findOneAndUpdate(
      { _id: counterId },
      {
        $inc: { sequence: 1 },
        $setOnInsert: {
          date: todayDate,
          type: "kot",
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    // Validate that the counter is for today's date
    if (counter && counter.date) {
      const counterDateStr = counter.date.toISOString().split("T")[0];
      if (counterDateStr !== dateStr) {
        throw new Error(
          `KOT counter date mismatch: expected ${dateStr}, got ${counterDateStr}`
        );
      }
    }

    if (!counter) {
      throw new Error("Failed to generate KOT counter");
    }

    // Format: 001, 002, 003, etc. (simple sequential, resets daily)
    const formattedNumber = counter.sequence.toString().padStart(3, "0");

    console.log(
      `✅ Generated KOT number: ${formattedNumber} for outlet ${outletId} (date: ${dateStr}, sequence: ${counter.sequence})`
    );
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

    // Validate user authentication
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        error: { message: "User not authenticated" },
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
    let retries = 5; // Increased retries for better reliability
    let lastError;

    while (retries > 0) {
      try {
        orderNumber = await generateOrderNumber(outletId.toString());

        // Convert userId string to ObjectId
        const createdByObjectId = new Types.ObjectId(req.user!.userId);

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
          createdBy: createdByObjectId,
        });

        console.log(`✅ Order created successfully: ${orderNumber}`);
        break; // Success, exit loop
      } catch (error: any) {
        lastError = error;

        // Check if it's a duplicate key error
        if (error.code === 11000) {
          retries--;
          console.error(
            `⚠️ Duplicate order number detected: ${orderNumber}. This order number already exists in the database.`
          );
          console.log(
            `⚠️ Duplicate key error (${error.message}), retrying with new number... (${retries} attempts left)`
          );

          if (retries > 0) {
            // Wait with exponential backoff + random jitter before generating new number
            const backoffMs = 100 * (6 - retries) + Math.random() * 50;
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          } else {
            console.error(
              `❌ Failed after all retries. Last attempted order number: ${orderNumber}`
            );
            console.error(
              "❌ Database may have inconsistent state. Please check the orders collection."
            );
          }
        }

        // If not a duplicate error or out of retries, throw
        console.error("❌ Order creation failed with error:", error);
        console.error("Error code:", error.code);
        console.error("Error name:", error.name);
        throw error;
      }
    }

    if (!order) {
      console.error("❌ Order creation failed after all retries");
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
      data: {
        ...order.toObject(),
        id: order._id, // Add id field for frontend compatibility
      },
    });
  } catch (error: any) {
    console.error("❌ Order creation error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    // Provide more helpful error messages for duplicate key errors
    let errorMessage = error.message || "Failed to create order";
    let errorCode = error.code;

    if (error.code === 11000) {
      errorMessage =
        "Unable to create order due to duplicate order number. This may indicate a database synchronization issue. Please try again.";
      errorCode = "DUPLICATE_ORDER_NUMBER";
    }

    res.status(500).json({
      success: false,
      error: {
        message: errorMessage,
        code: errorCode,
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

    // Base filter
    const filter: any = { outletId };

    // Handle status filter including 'inactive'
    if (status === "inactive") {
      // Show only inactive orders
      filter.isActive = false;
    } else if (status) {
      // Show active orders with specific status
      filter.status = status;
      filter.$or = [{ isActive: true }, { isActive: { $exists: false } }];
    } else {
      // Show all active orders (default)
      filter.$or = [{ isActive: true }, { isActive: { $exists: false } }];
    }
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
      if (startDate) {
        // Set to start of day (00:00:00.000)
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (endDate) {
        // Set to end of day (23:59:59.999) to include all orders on that day
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
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

    const order = await Order.findOne({
      _id: id,
      outletId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    })
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

    const order = await Order.findOne({
      _id: id,
      outletId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    });

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: "Order not found or has been deleted" },
      });
      return;
    }

    // Allow updating all active orders (user can modify any order before marking inactive)
    const hadKOT = order.status === "kot_generated";

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

    // If order had KOT, regenerate it with updated items
    if (hadKOT && order.kotId) {
      try {
        const existingKOT = await KOT.findById(order.kotId);
        if (existingKOT) {
          // Update KOT with new items (preserving required fields)
          existingKOT.items = order.items.map((item: any) => ({
            item: item.item,
            name: item.name,
            quantity: item.quantity,
            notes: item.notes,
            status: "pending" as const, // Reset status to pending for updated items
          }));
          existingKOT.updatedAt = new Date();
          await existingKOT.save();
          console.log(`✅ KOT ${order.kotId} updated for order ${id}`);
        }
      } catch (kotError: any) {
        console.error("Failed to update KOT:", kotError);
        // Continue even if KOT update fails
      }
    }

    // Update invoice if it exists
    try {
      // Dynamically import Invoice model to avoid circular dependency
      const Invoice = (await import("../models/Invoice")).default;
      const existingInvoice = await Invoice.findOne({ orderId: order._id });

      if (existingInvoice) {
        // Update invoice items and amounts
        existingInvoice.items = order.items;
        existingInvoice.subtotal = order.subtotal;
        existingInvoice.taxAmount = order.taxAmount;
        existingInvoice.total = order.total;
        existingInvoice.updatedAt = new Date();
        await existingInvoice.save();
        console.log(`✅ Invoice updated for order ${id}`);
      }
    } catch (invoiceError: any) {
      console.error("Failed to update invoice:", invoiceError);
      // Continue even if invoice update fails
    }

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

    // Validate user authentication
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        error: { message: "User not authenticated" },
      });
      return;
    }

    const order = await Order.findOne({
      _id: id,
      outletId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    });

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: "Order not found" },
      });
      return;
    }

    // Allow KOT generation for draft, kot_generated, on_hold, and completed orders
    // This allows regenerating KOT after editing an order
    if (order.status === "cancelled") {
      res.status(400).json({
        success: false,
        error: {
          message: "Cannot generate KOT for cancelled orders",
        },
      });
      return;
    }

    // Generate KOT number and create KOT with retry logic
    let kot;
    let kotNumber: string = "";
    let kotRetries = 5;
    let lastKotError;

    while (kotRetries > 0) {
      try {
        kotNumber = await generateKOTNumber(outletId.toString());

        // Convert userId string to ObjectId with validation
        if (!req.user!.userId || !Types.ObjectId.isValid(req.user!.userId)) {
          throw new Error(`Invalid user ID: ${req.user!.userId}`);
        }
        const createdByObjectId = new Types.ObjectId(req.user!.userId);

        console.log(`🔍 Creating KOT with data:`, {
          outletId: outletId.toString(),
          orderId: (order._id as Types.ObjectId).toString(),
          kotNumber,
          itemCount: order.items.length,
          createdBy: createdByObjectId.toString(),
        });

        // Validate items before creating KOT
        if (!order.items || order.items.length === 0) {
          throw new Error("Order has no items");
        }

        const kotItems = order.items.map((item) => {
          if (!item.item) {
            throw new Error(`Order item missing item reference: ${JSON.stringify(item)}`);
          }
          if (!item.name) {
            throw new Error(`Order item missing name: ${JSON.stringify(item)}`);
          }
          if (!item.quantity || item.quantity < 1) {
            throw new Error(`Invalid quantity for item ${item.name}: ${item.quantity}`);
          }
          return {
            item: item.item,
            name: item.name,
            quantity: item.quantity,
            notes: item.notes,
            status: "pending" as const,
          };
        });

        console.log(`🔍 Prepared ${kotItems.length} items for KOT`);

        kot = await KOT.create({
          outletId,
          orderId: order._id,
          kotNumber,
          items: kotItems,
          status: "pending",
          tableNumber: order.tableNumber,
          notes: order.notes,
          createdBy: createdByObjectId,
        });

        console.log(`✅ KOT created successfully: ${kotNumber}`);
        break; // Success
      } catch (error: any) {
        lastKotError = error;

        if (error.code === 11000) {
          kotRetries--;
          console.log(
            `⚠️ Duplicate KOT key error (${error.message}), retrying... (${kotRetries} attempts left)`
          );

          if (kotRetries > 0) {
            const backoffMs = 100 * (6 - kotRetries) + Math.random() * 50;
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            continue;
          } else {
            console.error("❌ Failed after all KOT retries");
          }
        }

        console.error("❌ KOT creation failed with error:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        if (error.errors) {
          console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
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

    const order = await Order.findOne({
      _id: id,
      outletId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    });

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: "Order not found" },
      });
      return;
    }

    // Allow holding orders that are not completed or cancelled
    if (order.status === "completed" || order.status === "cancelled") {
      res.status(400).json({
        success: false,
        error: { message: "Cannot hold completed or cancelled orders" },
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

    const order = await Order.findOne({
      _id: id,
      outletId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    });

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

    const order = await Order.findOne({
      _id: id,
      outletId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    });

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

// Complete order and create invoice
export const completeOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentMethod = "cash" } = req.body;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const order = await Order.findOne({
      _id: id,
      outletId,
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    });

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: "Order not found" },
      });
      return;
    }

    if (order.status === "cancelled") {
      res.status(400).json({
        success: false,
        error: { message: "Cancelled orders cannot be completed" },
      });
      return;
    }

    // Mark order as completed
    order.status = "completed";
    order.paymentStatus = "paid";
    order.paymentMethod = paymentMethod;
    order.completedAt = new Date();
    await order.save();

    // Create invoice if it doesn't exist
    try {
      const Invoice = (await import("../models/Invoice")).default;
      let invoice = await Invoice.findOne({ orderId: order._id });

      if (!invoice) {
        // Generate invoice number using Counter
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const financialYearStart = month < 4 ? year - 1 : year;
        const financialYearEnd = financialYearStart + 1;
        const counterId = `invoice_${outletId}_FY${financialYearStart}-${financialYearEnd}`;
        const financialYearDate = new Date(
          `${financialYearStart}-04-01T00:00:00.000Z`
        );

        const counter = await Counter.findOneAndUpdate(
          { _id: counterId },
          {
            $inc: { sequence: 1 },
            $setOnInsert: {
              date: financialYearDate,
              type: "invoice",
            },
          },
          {
            upsert: true,
            new: true,
          }
        );

        const invoiceNumber = counter.sequence.toString().padStart(3, "0");

        // Create new invoice
        invoice = new Invoice({
          outletId,
          orderId: order._id,
          invoiceNumber,
          items: order.items,
          subtotal: order.subtotal,
          taxAmount: order.taxAmount,
          total: order.total,
          customer: order.customer,
          paymentMethod,
          paymentStatus: "paid",
          paidAmount: order.total,
          createdBy: req.user!.userId,
          paidAt: new Date(),
        });
        await invoice.save();
        console.log(
          `✅ Invoice ${invoiceNumber} created for completed order ${order.orderNumber}`
        );
      } else {
        // Update existing invoice to paid
        invoice.paymentStatus = "paid";
        invoice.paidAmount = order.total;
        invoice.paidAt = new Date();
        await invoice.save();
        console.log(
          `✅ Invoice ${invoice.invoiceNumber} updated for order ${order.orderNumber}`
        );
      }
    } catch (invoiceError: any) {
      console.error("Failed to create/update invoice:", invoiceError);
      // Continue even if invoice creation fails
    }

    // Log activity
    await staffService.logActivity({
      userId: req.user!.userId,
      outletId: outletId.toString(),
      action: `Completed order #${order.orderNumber}`,
      actionType: "order_completed",
      metadata: { orderId: order._id, status: "completed" },
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
      error: { message: error.message || "Failed to complete order" },
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

    // Soft delete: Mark order as inactive instead of deleting
    order.isActive = false;
    await order.save();

    // Mark related KOT as inactive if exists
    if (order.kotId) {
      try {
        const kot = await KOT.findById(order.kotId);
        if (kot) {
          kot.isActive = false;
          await kot.save();
          console.log(`✅ KOT ${order.kotId} marked as inactive`);
        }
      } catch (kotError: any) {
        console.error("Failed to mark KOT as inactive:", kotError);
      }
    }

    // Mark related Invoice as inactive if exists
    try {
      const Invoice = (await import("../models/Invoice")).default;
      const invoice = await Invoice.findOne({ orderId: order._id });
      if (invoice) {
        invoice.isActive = false;
        await invoice.save();
        console.log(`✅ Invoice for order ${id} marked as inactive`);
      }
    } catch (invoiceError: any) {
      console.error("Failed to mark invoice as inactive:", invoiceError);
    }

    res.json({
      success: true,
      data: { message: "Order marked as inactive successfully" },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to delete order" },
    });
  }
};
