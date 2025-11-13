import mongoose, { Document, Schema } from "mongoose";

export interface INotificationPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  outletId: mongoose.Types.ObjectId;
  preferences: {
    new_orders: boolean;
    order_completed: boolean;
    low_stock: boolean;
    daily_summary: boolean;
    customer_feedback: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
    },
    preferences: {
      new_orders: { type: Boolean, default: true },
      order_completed: { type: Boolean, default: true },
      low_stock: { type: Boolean, default: true },
      daily_summary: { type: Boolean, default: false },
      customer_feedback: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint
NotificationPreferencesSchema.index(
  { userId: 1, outletId: 1 },
  { unique: true }
);

export default mongoose.model<INotificationPreferences>(
  "NotificationPreferences",
  NotificationPreferencesSchema
);
