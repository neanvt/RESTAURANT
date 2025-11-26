import mongoose, { Document, Schema } from "mongoose";

export interface IItem extends Document {
  outletId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category: mongoose.Types.ObjectId;
  price: number;
  image: {
    url?: string;
    isAiGenerated: boolean;
    aiPrompt?: string;
  };
  tax: {
    isApplicable: boolean;
    rate: number;
    type: "percentage" | "fixed";
  };
  isFavourite: boolean;
  isAvailable: boolean;
  isActive: boolean;
  inventory: {
    trackInventory: boolean;
    currentStock: number;
    lowStockAlert: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: [true, "Outlet ID is required"],
    },
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [100, "Item name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      url: {
        type: String,
        trim: true,
      },
      isAiGenerated: {
        type: Boolean,
        default: false,
      },
      aiPrompt: {
        type: String,
        trim: true,
      },
    },
    tax: {
      isApplicable: {
        type: Boolean,
        default: false,
      },
      rate: {
        type: Number,
        default: 0,
        min: [0, "Tax rate cannot be negative"],
      },
      type: {
        type: String,
        enum: ["percentage", "fixed"],
        default: "percentage",
      },
    },
    isFavourite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    inventory: {
      trackInventory: {
        type: Boolean,
        default: false,
      },
      currentStock: {
        type: Number,
        default: 0,
        min: [0, "Stock cannot be negative"],
      },
      lowStockAlert: {
        type: Number,
        default: 10,
        min: [0, "Low stock alert cannot be negative"],
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes
itemSchema.index({ outletId: 1, category: 1 });
itemSchema.index({ outletId: 1, isFavourite: 1 });
itemSchema.index({ outletId: 1, isAvailable: 1 });
itemSchema.index({ outletId: 1, name: 1 });

// Text index for search functionality
itemSchema.index({ name: "text", description: "text" });

// Virtual for calculated price with tax
itemSchema.virtual("priceWithTax").get(function () {
  if (!this.tax.isApplicable) {
    return this.price;
  }
  if (this.tax.type === "percentage") {
    return this.price + (this.price * this.tax.rate) / 100;
  }
  return this.price + this.tax.rate;
});

// Method to check if item is low on stock
itemSchema.methods.isLowStock = function (): boolean {
  if (!this.inventory.trackInventory) {
    return false;
  }
  return this.inventory.currentStock <= this.inventory.lowStockAlert;
};

// Method to check if item is out of stock
itemSchema.methods.isOutOfStock = function (): boolean {
  if (!this.inventory.trackInventory) {
    return false;
  }
  return this.inventory.currentStock === 0;
};

const Item = mongoose.model<IItem>("Item", itemSchema);

export default Item;
