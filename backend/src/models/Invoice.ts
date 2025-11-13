import mongoose, { Schema, Document } from "mongoose";

export interface IInvoiceItem {
  item: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  tax?: {
    rate: number;
    amount: number;
  };
  subtotal: number;
  total: number;
}

export interface IInvoice extends Document {
  outletId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  items: IInvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discount?: {
    type: "percentage" | "fixed";
    value: number;
    amount: number;
  };
  total: number;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  paymentMethod: "cash" | "upi" | "card" | "phonepe" | "googlepay";
  paymentStatus: "pending" | "paid";
  paidAmount: number;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
  item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  tax: {
    rate: { type: Number },
    amount: { type: Number },
  },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
});

const InvoiceSchema = new Schema<IInvoice>(
  {
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    invoiceNumber: { type: String, required: true },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    discount: {
      type: {
        type: String,
        enum: ["percentage", "fixed"],
      },
      value: { type: Number },
      amount: { type: Number },
    },
    total: { type: Number, required: true },
    customer: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "phonepe", "googlepay"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
      index: true,
    },
    paidAmount: { type: Number, default: 0 },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    paidAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Index for invoice number generation
InvoiceSchema.index({ outletId: 1, createdAt: -1 });

// Compound unique index for invoiceNumber per outlet
InvoiceSchema.index({ outletId: 1, invoiceNumber: 1 }, { unique: true });

// Index for searching
InvoiceSchema.index({
  invoiceNumber: 1,
  "customer.name": 1,
  "customer.phone": 1,
});

export default mongoose.model<IInvoice>("Invoice", InvoiceSchema);
