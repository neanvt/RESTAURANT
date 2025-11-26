import mongoose, { Schema, Document } from "mongoose";

export interface IPrinter extends Document {
  outlet: mongoose.Types.ObjectId;
  name: string;
  type: "thermal" | "laser" | "inkjet";
  connectionType: "usb" | "network" | "bluetooth";
  ipAddress?: string;
  port?: number;
  deviceId?: string;
  status: "online" | "offline" | "error" | "paper_out" | "maintenance";
  lastOnline?: Date;
  isDefault: boolean;
  printKOT: boolean;
  printInvoice: boolean;
  paperWidth: 58 | 80; // in mm
  characterWidth: number; // characters per line
  settings: {
    cutPaper: boolean;
    cashDrawer: boolean;
    beep: boolean;
    copies: number;
    feedLines: number;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PrinterSchema: Schema = new Schema(
  {
    outlet: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: [true, "Outlet is required"],
    },
    name: {
      type: String,
      required: [true, "Printer name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["thermal", "laser", "inkjet"],
      default: "thermal",
    },
    connectionType: {
      type: String,
      enum: ["usb", "network", "bluetooth"],
      required: [true, "Connection type is required"],
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    port: {
      type: Number,
      min: 1,
      max: 65535,
    },
    deviceId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["online", "offline", "error", "paper_out", "maintenance"],
      default: "offline",
    },
    lastOnline: {
      type: Date,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    printKOT: {
      type: Boolean,
      default: true,
    },
    printInvoice: {
      type: Boolean,
      default: true,
    },
    paperWidth: {
      type: Number,
      enum: [58, 80],
      default: 80,
    },
    characterWidth: {
      type: Number,
      default: 48, // typical for 80mm thermal
    },
    settings: {
      cutPaper: {
        type: Boolean,
        default: true,
      },
      cashDrawer: {
        type: Boolean,
        default: false,
      },
      beep: {
        type: Boolean,
        default: true,
      },
      copies: {
        type: Number,
        min: 1,
        max: 5,
        default: 1,
      },
      feedLines: {
        type: Number,
        min: 0,
        max: 10,
        default: 3,
      },
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
PrinterSchema.index({ outlet: 1, name: 1 });
PrinterSchema.index({ outlet: 1, status: 1 });
PrinterSchema.index({ outlet: 1, isDefault: 1 });

// Ensure only one default printer per outlet
PrinterSchema.pre("save", async function (next) {
  if (this.isDefault && this.isModified("isDefault")) {
    // Remove default flag from other printers in the same outlet
    await mongoose
      .model("Printer")
      .updateMany(
        { outlet: this.outlet, _id: { $ne: this._id } },
        { $set: { isDefault: false } }
      );
  }
  next();
});

// Update lastOnline when status changes to online
PrinterSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "online") {
    this.lastOnline = new Date();
  }
  next();
});

// Methods
PrinterSchema.methods.toJSON = function () {
  const printer = this.toObject();
  delete printer.__v;
  return printer;
};

const Printer = mongoose.model<IPrinter>("Printer", PrinterSchema);

export default Printer;
