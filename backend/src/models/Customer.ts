import mongoose, { Document, Schema } from "mongoose";

export interface ICustomer extends Document {
  outlet: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: Date;
  anniversary?: Date;
  tags?: string[];
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  loyaltyPoints: number;
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum";
  lifetimePoints: number;
  discountEligible: boolean;
  discountPercentage: number;
  visitCount: number;
  averageOrderValue: number;
  lastVisitDate?: Date;
  referredBy?: mongoose.Types.ObjectId;
  referralCode?: string;
  marketingPreferences: {
    emailMarketing: boolean;
    smsMarketing: boolean;
    whatsappMarketing: boolean;
    pushNotifications: boolean;
  };
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    outlet: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    anniversary: {
      type: Date,
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastOrderDate: {
      type: Date,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyTier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },
    lifetimePoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountEligible: {
      type: Boolean,
      default: false,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    visitCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastVisitDate: {
      type: Date,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
    },
    referralCode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    marketingPreferences: {
      emailMarketing: {
        type: Boolean,
        default: true,
      },
      smsMarketing: {
        type: Boolean,
        default: true,
      },
      whatsappMarketing: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Compound index for outlet and phone
customerSchema.index({ outlet: 1, phone: 1 }, { unique: true });

// Text index for search

// Index for loyalty tier
customerSchema.index({ outlet: 1, loyaltyTier: 1 });

// Pre-save hook to calculate loyalty tier based on lifetime points
customerSchema.pre("save", function (next) {
  if (this.isModified("lifetimePoints")) {
    // Tier thresholds
    if (this.lifetimePoints >= 10000) {
      this.loyaltyTier = "platinum";
      this.discountPercentage = 15;
    } else if (this.lifetimePoints >= 5000) {
      this.loyaltyTier = "gold";
      this.discountPercentage = 10;
    } else if (this.lifetimePoints >= 2000) {
      this.loyaltyTier = "silver";
      this.discountPercentage = 5;
    } else {
      this.loyaltyTier = "bronze";
      this.discountPercentage = 0;
    }

    // Set discount eligibility based on tier
    this.discountEligible = this.loyaltyTier !== "bronze";
  }

  // Calculate average order value
  if (this.totalOrders > 0 && this.isModified("totalSpent")) {
    this.averageOrderValue = Math.round(this.totalSpent / this.totalOrders);
  }

  next();
});

// Method to add loyalty points
customerSchema.methods.addLoyaltyPoints = function (points: number) {
  this.loyaltyPoints += points;
  this.lifetimePoints += points;
};

// Method to redeem loyalty points
customerSchema.methods.redeemLoyaltyPoints = function (points: number) {
  if (this.loyaltyPoints >= points) {
    this.loyaltyPoints -= points;
    return true;
  }
  return false;
};

// Method to generate referral code
customerSchema.methods.generateReferralCode = function () {
  if (!this.referralCode) {
    const code = `REF${this.phone.slice(-4)}${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;
    this.referralCode = code;
  }
  return this.referralCode;
};
customerSchema.index({ name: "text", phone: "text", email: "text" });

const Customer = mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;
