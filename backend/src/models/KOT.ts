import mongoose, { Schema, Document } from "mongoose";

export interface IKOTItem {
  item: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  notes?: string;
  status: "pending" | "preparing" | "ready";
}

export interface IKOT extends Document {
  outletId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  kotNumber: string;
  items: IKOTItem[];
  status: "pending" | "in_progress" | "completed";
  tableNumber?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const KOTItemSchema = new Schema<IKOTItem>({
  item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  notes: { type: String },
  status: {
    type: String,
    enum: ["pending", "preparing", "ready"],
    default: "pending",
  },
});

const KOTSchema = new Schema<IKOT>(
  {
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
      index: true,
    },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    kotNumber: { type: String, required: true },
    items: [KOTItemSchema],
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
      index: true,
    },
    tableNumber: { type: String },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Index for KOT number generation
KOTSchema.index({ outletId: 1, createdAt: -1 });

// Compound unique index for kotNumber per outlet
KOTSchema.index({ outletId: 1, kotNumber: 1 }, { unique: true });

export default mongoose.model<IKOT>("KOT", KOTSchema);
