import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  outletId: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: [true, "Outlet ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    icon: {
      type: String,
      default: "📦",
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: [0, "Display order cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Compound index for outlet and display order
categorySchema.index({ outletId: 1, displayOrder: 1 });

// Compound index for outlet and name (unique per outlet)
categorySchema.index({ outletId: 1, name: 1 }, { unique: true });

// Pre-save middleware to ensure unique display order per outlet
categorySchema.pre("save", async function (next) {
  if (this.isNew && this.displayOrder === 0) {
    const Category = this.constructor as mongoose.Model<ICategory>;
    const maxOrder = await Category.findOne({ outletId: this.outletId })
      .sort({ displayOrder: -1 })
      .select("displayOrder");
    this.displayOrder = maxOrder ? maxOrder.displayOrder + 1 : 0;
  }
  next();
});

const Category = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
