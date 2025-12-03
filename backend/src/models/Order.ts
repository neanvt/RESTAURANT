import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
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
  notes?: string;
}

export interface IOrder extends Document {
  outletId: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: "draft" | "kot_generated" | "on_hold" | "completed" | "cancelled";
  paymentStatus: "pending" | "partial" | "paid";
  paymentMethod?: "cash" | "upi" | "card" | "phonepe" | "googlepay";
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  tableNumber?: string;
  kotId?: mongoose.Types.ObjectId;
  notes?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
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
  notes: { type: String },
});

const OrderSchema = new Schema<IOrder>(
  {
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
    },
    orderNumber: { type: String, required: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "kot_generated", "on_hold", "completed", "cancelled"],
      default: "draft",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "phonepe", "googlepay"],
    },
    customer: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
    },
    tableNumber: { type: String },
    kotId: { type: Schema.Types.ObjectId, ref: "KOT" },
    notes: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Index for order number generation
OrderSchema.index({ outletId: 1, createdAt: -1 });

// Compound unique index for orderNumber per outlet
OrderSchema.index({ outletId: 1, orderNumber: 1 }, { unique: true });

// Index for searching
OrderSchema.index({ orderNumber: 1, "customer.name": 1, "customer.phone": 1 });

export default mongoose.model<IOrder>("Order", OrderSchema);
