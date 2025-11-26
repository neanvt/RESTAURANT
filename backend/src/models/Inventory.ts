import mongoose, { Schema, Document } from "mongoose";

export interface IRestockHistory {
  date: Date;
  quantity: number;
  cost: number;
  restockedBy: mongoose.Types.ObjectId;
  notes?: string;
}

export interface IInventory extends Document {
  outlet: mongoose.Types.ObjectId;
  name: string;
  unit:
    | "kg"
    | "litre"
    | "piece"
    | "packet"
    | "gram"
    | "ml"
    | "dozen"
    | "box"
    | "bottle";
  currentStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  unitCost?: number;
  supplier?: string;
  category?: string;
  lowStockAlert: boolean;
  lastRestocked?: Date;
  restockHistory: IRestockHistory[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RestockHistorySchema: Schema = new Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.01, "Quantity must be greater than 0"],
  },
  cost: {
    type: Number,
    required: true,
    min: [0, "Cost cannot be negative"],
  },
  restockedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
});

const InventorySchema: Schema = new Schema(
  {
    outlet: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: [true, "Outlet is required"],
    },
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    unit: {
      type: String,
      enum: [
        "kg",
        "litre",
        "piece",
        "packet",
        "gram",
        "ml",
        "dozen",
        "box",
        "bottle",
      ],
      required: [true, "Unit is required"],
    },
    currentStock: {
      type: Number,
      required: [true, "Current stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    reorderLevel: {
      type: Number,
      required: [true, "Reorder level is required"],
      min: [0, "Reorder level cannot be negative"],
      default: 10,
    },
    reorderQuantity: {
      type: Number,
      required: [true, "Reorder quantity is required"],
      min: [0.01, "Reorder quantity must be greater than 0"],
      default: 50,
    },
    unitCost: {
      type: Number,
      min: [0, "Unit cost cannot be negative"],
    },
    supplier: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    lowStockAlert: {
      type: Boolean,
      default: false,
    },
    lastRestocked: {
      type: Date,
    },
    restockHistory: [RestockHistorySchema],
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
InventorySchema.index({ outlet: 1, name: 1 });
InventorySchema.index({ outlet: 1, lowStockAlert: 1 });
InventorySchema.index({ outlet: 1, category: 1 });

// Pre-save middleware to check low stock alert
InventorySchema.pre<IInventory>("save", function (next) {
  if (this.currentStock <= this.reorderLevel) {
    this.lowStockAlert = true;
  } else {
    this.lowStockAlert = false;
  }
  next();
});

// Methods
InventorySchema.methods.toJSON = function () {
  const inventory = this.toObject();
  delete inventory.__v;
  return inventory;
};

const Inventory = mongoose.model<IInventory>("Inventory", InventorySchema);

export default Inventory;
