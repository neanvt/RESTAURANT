import mongoose, { Schema, Document } from "mongoose";

export interface IExpense extends Document {
  outlet: mongoose.Types.ObjectId;
  category: string; // Allow custom categories
  amount: number;
  price?: number; // Optional unit price
  quantity?: number; // Optional quantity field
  description: string;
  date: Date;
  paidTo: string;
  paymentMethod: "cash" | "upi" | "card" | "bank_transfer" | "cheque";
  receipt?: string; // Image URL
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    outlet: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: [true, "Outlet is required"],
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
      min: [0, "Quantity cannot be negative"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },
    paidTo: {
      type: String,
      required: [true, "Paid to is required"],
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "bank_transfer", "cheque"],
      required: [true, "Payment method is required"],
    },
    receipt: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
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

// Indexes for better query performance
ExpenseSchema.index({ outlet: 1, date: -1 });
ExpenseSchema.index({ outlet: 1, category: 1, date: -1 });
ExpenseSchema.index({ createdBy: 1, date: -1 });

// Methods
ExpenseSchema.methods.toJSON = function () {
  const expense = this.toObject();
  delete expense.__v;
  return expense;
};

const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
