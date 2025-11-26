import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  phone: string;
  name?: string;
  password?: string;
  email?: string;
  role: "primary_admin" | "secondary_admin" | "staff" | "waiter" | "kitchen";
  outlets: mongoose.Types.ObjectId[];
  currentOutlet?: mongoose.Types.ObjectId;
  permissions: string[];
  invitedBy?: mongoose.Types.ObjectId;
  status: "invited" | "joined" | "suspended";
  lastActive?: Date;
  isActive: boolean;
  requirePasswordChange?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[6-9]\d{9}$/.test(v);
        },
        message: "Please provide a valid 10-digit Indian phone number",
      },
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["primary_admin", "secondary_admin", "staff", "waiter", "kitchen"],
      default: "staff",
      required: true,
    },
    permissions: [
      {
        type: String,
        enum: [
          "manage_items",
          "manage_orders",
          "manage_customers",
          "view_reports",
          "manage_staff",
          "manage_outlets",
          "manage_expenses",
          "manage_inventory",
          "manage_kots",
        ],
      },
    ],
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["invited", "joined", "suspended"],
      default: "joined",
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    outlets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Outlet",
      },
    ],
    currentOutlet: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    requirePasswordChange: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
// Note: phone already has unique index from schema definition
UserSchema.index({ outlets: 1 });
UserSchema.index({ isActive: 1 });

// Methods
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.__v;
  return user;
};

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
