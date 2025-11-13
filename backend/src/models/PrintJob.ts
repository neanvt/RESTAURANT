import mongoose, { Schema, Document } from "mongoose";

export interface IPrintJob extends Document {
  outlet: mongoose.Types.ObjectId;
  printer: mongoose.Types.ObjectId;
  type: "kot" | "invoice" | "test";
  documentId?: mongoose.Types.ObjectId; // Reference to KOT or Invoice
  status: "pending" | "printing" | "completed" | "failed" | "cancelled";
  content: string; // ESC/POS commands or print content
  copies: number;
  retryCount: number;
  maxRetries: number;
  error?: string;
  printedAt?: Date;
  printedBy?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PrintJobSchema: Schema = new Schema(
  {
    outlet: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: [true, "Outlet is required"],
      index: true,
    },
    printer: {
      type: Schema.Types.ObjectId,
      ref: "Printer",
      required: [true, "Printer is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["kot", "invoice", "test"],
      required: [true, "Print type is required"],
      index: true,
    },
    documentId: {
      type: Schema.Types.ObjectId,
      refPath: "type",
    },
    status: {
      type: String,
      enum: ["pending", "printing", "completed", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    content: {
      type: String,
      required: [true, "Print content is required"],
    },
    copies: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
      min: 0,
    },
    error: {
      type: String,
    },
    printedAt: {
      type: Date,
    },
    printedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
PrintJobSchema.index({ outlet: 1, status: 1, createdAt: -1 });
PrintJobSchema.index({ printer: 1, status: 1 });
PrintJobSchema.index({ outlet: 1, type: 1, createdAt: -1 });

// TTL index - automatically delete completed/failed jobs after 7 days
PrintJobSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 7 * 24 * 60 * 60, // 7 days
    partialFilterExpression: {
      status: { $in: ["completed", "failed", "cancelled"] },
    },
  }
);

// Update printedAt when status changes to completed
PrintJobSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "completed" &&
    !this.printedAt
  ) {
    this.printedAt = new Date();
  }
  next();
});

// Methods
PrintJobSchema.methods.toJSON = function () {
  const printJob = this.toObject();
  delete printJob.__v;
  return printJob;
};

const PrintJob = mongoose.model<IPrintJob>("PrintJob", PrintJobSchema);

export default PrintJob;
