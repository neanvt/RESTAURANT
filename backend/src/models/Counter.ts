import mongoose, { Schema, Document } from "mongoose";

export interface ICounter extends Document {
  _id: string; // format: "order_<outletId>_<date>" or "kot_<outletId>_<date>"
  sequence: number;
  date: Date;
  type?: "order" | "invoice" | "kot"; // Type of counter for selective TTL
}

const CounterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    sequence: { type: Number, default: 0 },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["order", "invoice", "kot"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for cleanup of old KOT counters only (not order/invoice counters)
// KOT counters reset daily and can be cleaned up after 7 days
// Order and Invoice counters persist for the financial year
CounterSchema.index(
  { date: 1 },
  {
    expireAfterSeconds: 86400 * 7, // Delete after 7 days
    partialFilterExpression: { type: "kot" }, // Only apply to KOT counters
  }
);

export default mongoose.model<ICounter>("Counter", CounterSchema);
