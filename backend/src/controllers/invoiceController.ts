import { Request, Response } from "express";
import Invoice from "../models/Invoice";
import Order from "../models/Order";
import Outlet from "../models/Outlet";
import Counter from "../models/Counter";
import QRCode from "qrcode";

// Generate invoice number - uses atomic counter to prevent race conditions
const generateInvoiceNumber = async (outletId: string): Promise<string> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const counterId = `invoice_${outletId}_${dateStr}`;

  // Use findOneAndUpdate with upsert to atomically increment the counter
  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    {
      $inc: { sequence: 1 },
      $setOnInsert: { date: today },
    },
    {
      upsert: true,
      new: true,
    }
  );

  return counter.sequence.toString();
};

// Generate UPI QR code
const generateUPIQR = async (
  upiId: string,
  amount: number,
  name: string,
  invoiceNumber: string
): Promise<string> => {
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    name
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(invoiceNumber)}`;

  try {
    const qrCode = await QRCode.toDataURL(upiString);
    return qrCode;
  } catch (error) {
    throw new Error("Failed to generate QR code");
  }
};

// Create invoice from order
export const createInvoice = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId, paymentMethod, discount } = req.body;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    if (!orderId) {
      res.status(400).json({
        success: false,
        error: { message: "Order ID is required" },
      });
      return;
    }

    if (!paymentMethod) {
      res.status(400).json({
        success: false,
        error: { message: "Payment method is required" },
      });
      return;
    }

    // Get order
    const order = await Order.findOne({ _id: orderId, outletId });

    if (!order) {
      res.status(404).json({
        success: false,
        error: { message: "Order not found" },
      });
      return;
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ orderId });
    if (existingInvoice) {
      res.status(400).json({
        success: false,
        error: { message: "Invoice already exists for this order" },
      });
      return;
    }

    // Calculate discount if provided
    let discountAmount = 0;
    let discountData;

    if (discount && discount.value > 0) {
      if (discount.type === "percentage") {
        discountAmount = (order.subtotal * discount.value) / 100;
      } else {
        discountAmount = discount.value;
      }

      discountData = {
        type: discount.type,
        value: discount.value,
        amount: discountAmount,
      };
    }

    // Calculate final total
    const finalTotal = order.total - discountAmount;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(outletId.toString());

    // Create invoice - all orders are prepaid, so mark as paid immediately
    const invoice = await Invoice.create({
      outletId,
      orderId: order._id,
      invoiceNumber,
      items: order.items,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      discount: discountData,
      total: finalTotal,
      customer: order.customer,
      paymentMethod,
      paymentStatus: "paid",
      paidAmount: finalTotal,
      paidAt: new Date(),
      notes: order.notes,
      createdBy: req.user!.userId,
    });

    // Update order status
    order.status = "completed";
    order.paymentMethod = paymentMethod;
    order.paymentStatus = "paid";
    order.completedAt = new Date();
    await order.save();

    // Generate QR code for UPI payments
    let qrCode;
    if (["upi", "phonepe", "googlepay"].includes(paymentMethod)) {
      const outlet = await Outlet.findById(outletId);
      if (outlet?.upiDetails?.upiId) {
        qrCode = await generateUPIQR(
          outlet.upiDetails.upiId,
          finalTotal,
          outlet.businessName,
          invoiceNumber
        );
      }
    }

    res.status(201).json({
      success: true,
      data: { invoice, qrCode },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to create invoice" },
    });
  }
};

// Get all invoices
export const getInvoices = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const {
      paymentStatus,
      paymentMethod,
      search,
      startDate,
      endDate,
      page = "1",
      limit = "20",
    } = req.query;

    const filter: any = { outletId };

    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } },
      ];
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate("orderId", "orderNumber tableNumber")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Invoice.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        invoices,
        total,
        page: pageNum,
        pages,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch invoices" },
    });
  }
};

// Get single invoice
export const getInvoice = async (
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

    const invoice = await Invoice.findOne({ _id: id, outletId })
      .populate("orderId", "orderNumber tableNumber")
      .populate("createdBy", "name email");

    if (!invoice) {
      res.status(404).json({
        success: false,
        error: { message: "Invoice not found" },
      });
      return;
    }

    // Generate QR code if UPI payment
    let qrCode;
    if (
      ["upi", "phonepe", "googlepay"].includes(invoice.paymentMethod) &&
      invoice.paymentStatus === "pending"
    ) {
      const outlet = await Outlet.findById(outletId);
      if (outlet?.upiDetails?.upiId) {
        qrCode = await generateUPIQR(
          outlet.upiDetails.upiId,
          invoice.total,
          outlet.businessName,
          invoice.invoiceNumber
        );
      }
    }

    res.json({
      success: true,
      data: { invoice, qrCode },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch invoice" },
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paidAmount } = req.body;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    if (!status) {
      res.status(400).json({
        success: false,
        error: { message: "Payment status is required" },
      });
      return;
    }

    const invoice = await Invoice.findOne({ _id: id, outletId });

    if (!invoice) {
      res.status(404).json({
        success: false,
        error: { message: "Invoice not found" },
      });
      return;
    }

    invoice.paymentStatus = status;
    if (paidAmount !== undefined) {
      invoice.paidAmount = paidAmount;
    }

    if (status === "paid") {
      invoice.paidAt = new Date();
      if (!invoice.paidAmount || invoice.paidAmount === 0) {
        invoice.paidAmount = invoice.total;
      }
    }

    await invoice.save();

    // Update order payment status
    await Order.findByIdAndUpdate(invoice.orderId, {
      paymentStatus: status,
    });

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to update payment status" },
    });
  }
};

// Get invoice by order
export const getInvoiceByOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const invoice = await Invoice.findOne({ orderId, outletId })
      .populate("orderId", "orderNumber tableNumber")
      .populate("createdBy", "name email");

    if (!invoice) {
      res.status(404).json({
        success: false,
        error: { message: "Invoice not found" },
      });
      return;
    }

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to fetch invoice" },
    });
  }
};

// Get sales summary
export const getSalesSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: { message: "No outlet selected" },
      });
      return;
    }

    const { startDate, endDate } = req.query;

    const filter: any = { outletId, paymentStatus: "paid" };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const invoices = await Invoice.find(filter);

    const summary = {
      totalSales: 0,
      totalOrders: invoices.length,
      totalTax: 0,
      totalDiscount: 0,
      paymentMethods: {} as Record<string, { count: number; amount: number }>,
    };

    invoices.forEach((invoice) => {
      summary.totalSales += invoice.total;
      summary.totalTax += invoice.taxAmount;
      summary.totalDiscount += invoice.discount?.amount || 0;

      const method = invoice.paymentMethod;
      if (!summary.paymentMethods[method]) {
        summary.paymentMethods[method] = { count: 0, amount: 0 };
      }
      summary.paymentMethods[method].count++;
      summary.paymentMethods[method].amount += invoice.total;
    });

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to get sales summary" },
    });
  }
};

// Print invoice
export const printInvoice = async (
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

    const invoice = await Invoice.findOne({ _id: id, outletId })
      .populate("orderId", "orderNumber tableNumber")
      .populate("createdBy", "name email");

    if (!invoice) {
      res.status(404).json({
        success: false,
        error: { message: "Invoice not found" },
      });
      return;
    }

    // TODO: Implement actual printer integration here
    // For now, just return success
    console.log(`Invoice ${invoice.invoiceNumber} sent to printer`);

    res.json({
      success: true,
      message: "Invoice sent to printer",
      data: invoice,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message || "Failed to print invoice" },
    });
  }
};
