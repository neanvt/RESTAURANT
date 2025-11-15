import mongoose, { Schema, Document } from "mongoose";

export interface ICounter extends Document {
  _id: string; // format: "order_<outletId>_<date>" or "kot_<outletId>_<date>"
  sequence: number;
  date: Date;
}

const CounterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    sequence: { type: Number, default: 0 },
    date: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// Index for cleanup of old counters
CounterSchema.index({ date: 1 }, { expireAfterSeconds: 86400 * 7 }); // Delete after 7 days

export default mongoose.model<ICounter>("Counter", CounterSchema);
