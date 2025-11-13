import mongoose, { Schema, Document } from "mongoose";

export interface IStaffActivity extends Document {
  user: mongoose.Types.ObjectId;
  outlet: mongoose.Types.ObjectId;
  action: string;
  actionType:
    | "order_created"
    | "order_updated"
    | "item_created"
    | "item_updated"
    | "invoice_generated"
    | "customer_added"
    | "kot_generated"
    | "expense_added"
    | "login"
    | "logout";
  metadata: any;
  ipAddress: string;
  userAgent?: string;
  timestamp: Date;
}

const StaffActivitySchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    outlet: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    actionType: {
      type: String,
      enum: [
        "order_created",
        "order_updated",
        "item_created",
        "item_updated",
        "invoice_generated",
        "customer_added",
        "kot_generated",
        "expense_added",
        "login",
        "logout",
      ],
      required: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
StaffActivitySchema.index({ user: 1, timestamp: -1 });
StaffActivitySchema.index({ outlet: 1, timestamp: -1 });
StaffActivitySchema.index({ actionType: 1, timestamp: -1 });

// TTL index to automatically delete old activities after 90 days
StaffActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

const StaffActivity = mongoose.model<IStaffActivity>(
  "StaffActivity",
  StaffActivitySchema
);

export default StaffActivity;
