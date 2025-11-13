import mongoose, { Schema, Document, Model } from "mongoose";

export type SubscriptionTier = "free" | "pro" | "enterprise";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "expired";
export type BillingCycle = "monthly" | "yearly";

export interface ITierConfig {
  features: {
    maxUsers: number;
    maxItems: number;
    maxOrders: number;
    aiMenuScanning: boolean;
    aiImageGeneration: boolean;
    advancedReports: boolean;
    loyaltyProgram: boolean;
    inventoryManagement: boolean;
    expenseTracking: boolean;
    printerIntegration: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    whatsappIntegration: boolean;
    emailMarketing: boolean;
  };
  limits: {
    maxUsers: number;
    maxItems: number;
    maxOrdersPerMonth: number;
    aiScansPerMonth: number;
    aiImagesPerMonth: number;
  };
  pricing: {
    monthly: { amount: number; currency: string };
    yearly: { amount: number; currency: string };
  };
}

export interface ISubscription extends Document {
  outlet: mongoose.Types.ObjectId;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  features: {
    maxUsers: number;
    maxItems: number;
    maxOrders: number;
    aiMenuScanning: boolean;
    aiImageGeneration: boolean;
    advancedReports: boolean;
    loyaltyProgram: boolean;
    inventoryManagement: boolean;
    expenseTracking: boolean;
    printerIntegration: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    whatsappIntegration: boolean;
    emailMarketing: boolean;
  };
  usage: {
    users: number;
    items: number;
    orders: number;
    aiScans: number;
    aiImages: number;
  };
  limits: {
    maxUsers: number;
    maxItems: number;
    maxOrdersPerMonth: number;
    aiScansPerMonth: number;
    aiImagesPerMonth: number;
  };
  pricing: {
    amount: number;
    currency: string;
  };
  payment?: {
    lastPaymentDate?: Date;
    lastPaymentAmount?: number;
    nextPaymentDate?: Date;
    paymentMethod?: string;
    razorpaySubscriptionId?: string;
    razorpayCustomerId?: string;
  };
  metadata?: {
    notes?: string;
    tags?: string[];
    customFields?: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isActive(): boolean;
  isTrialing(): boolean;
  isExpired(): boolean;
  hasFeature(feature: string): boolean;
  canUseFeature(feature: string): boolean;
  incrementUsage(metric: string, amount?: number): Promise<void>;
  resetMonthlyUsage(): Promise<void>;
  hasReachedLimit(metric: string): boolean;
  getRemainingQuota(metric: string): number;
}

export interface ISubscriptionModel extends Model<ISubscription> {
  getTierConfig(tier: SubscriptionTier): ITierConfig;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    outlet: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
      unique: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "trialing", "past_due", "canceled", "expired"],
      default: "trialing",
      required: true,
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    trialStart: {
      type: Date,
    },
    trialEnd: {
      type: Date,
    },
    canceledAt: {
      type: Date,
    },
    features: {
      maxUsers: { type: Number, default: 1 },
      maxItems: { type: Number, default: 50 },
      maxOrders: { type: Number, default: 100 },
      aiMenuScanning: { type: Boolean, default: false },
      aiImageGeneration: { type: Boolean, default: false },
      advancedReports: { type: Boolean, default: false },
      loyaltyProgram: { type: Boolean, default: false },
      inventoryManagement: { type: Boolean, default: false },
      expenseTracking: { type: Boolean, default: false },
      printerIntegration: { type: Boolean, default: false },
      customBranding: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      whatsappIntegration: { type: Boolean, default: false },
      emailMarketing: { type: Boolean, default: false },
    },
    usage: {
      users: { type: Number, default: 0 },
      items: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
      aiScans: { type: Number, default: 0 },
      aiImages: { type: Number, default: 0 },
    },
    limits: {
      maxUsers: { type: Number, default: 1 },
      maxItems: { type: Number, default: 50 },
      maxOrdersPerMonth: { type: Number, default: 100 },
      aiScansPerMonth: { type: Number, default: 0 },
      aiImagesPerMonth: { type: Number, default: 0 },
    },
    pricing: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
    },
    payment: {
      lastPaymentDate: { type: Date },
      lastPaymentAmount: { type: Number },
      nextPaymentDate: { type: Date },
      paymentMethod: { type: String },
      razorpaySubscriptionId: { type: String },
      razorpayCustomerId: { type: String },
    },
    metadata: {
      notes: { type: String },
      tags: [{ type: String }],
      customFields: { type: Schema.Types.Mixed },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SubscriptionSchema.index({ outlet: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ tier: 1 });
SubscriptionSchema.index({ currentPeriodEnd: 1 });

// Methods
SubscriptionSchema.methods.isActive = function (): boolean {
  return this.status === "active" || this.status === "trialing";
};

SubscriptionSchema.methods.isTrialing = function (): boolean {
  return (
    this.status === "trialing" && this.trialEnd && new Date() < this.trialEnd
  );
};

SubscriptionSchema.methods.isExpired = function (): boolean {
  return new Date() > this.currentPeriodEnd;
};

SubscriptionSchema.methods.hasFeature = function (feature: string): boolean {
  return this.features[feature as keyof typeof this.features] === true;
};

SubscriptionSchema.methods.canUseFeature = function (feature: string): boolean {
  if (!this.isActive()) return false;
  return this.hasFeature(feature);
};

SubscriptionSchema.methods.incrementUsage = async function (
  metric: string,
  amount: number = 1
): Promise<void> {
  if (this.usage[metric as keyof typeof this.usage] !== undefined) {
    this.usage[metric as keyof typeof this.usage] += amount;
    await this.save();
  }
};

SubscriptionSchema.methods.resetMonthlyUsage =
  async function (): Promise<void> {
    this.usage.orders = 0;
    this.usage.aiScans = 0;
    this.usage.aiImages = 0;
    await this.save();
  };

SubscriptionSchema.methods.hasReachedLimit = function (
  metric: string
): boolean {
  const usageKey = metric as keyof typeof this.usage;
  const limitKey = `max${
    metric.charAt(0).toUpperCase() + metric.slice(1)
  }` as keyof typeof this.limits;

  if (
    this.usage[usageKey] !== undefined &&
    this.limits[limitKey] !== undefined
  ) {
    return this.usage[usageKey] >= this.limits[limitKey];
  }

  return false;
};

SubscriptionSchema.methods.getRemainingQuota = function (
  metric: string
): number {
  const usageKey = metric as keyof typeof this.usage;
  const limitKey = `max${
    metric.charAt(0).toUpperCase() + metric.slice(1)
  }` as keyof typeof this.limits;

  if (
    this.usage[usageKey] !== undefined &&
    this.limits[limitKey] !== undefined
  ) {
    return Math.max(0, this.limits[limitKey] - this.usage[usageKey]);
  }

  return 0;
};

// Static methods
SubscriptionSchema.statics.getTierConfig = function (tier: SubscriptionTier) {
  const configs = {
    free: {
      features: {
        maxUsers: 1,
        maxItems: 50,
        maxOrders: 100,
        aiMenuScanning: false,
        aiImageGeneration: false,
        advancedReports: false,
        loyaltyProgram: false,
        inventoryManagement: false,
        expenseTracking: false,
        printerIntegration: false,
        customBranding: false,
        apiAccess: false,
        prioritySupport: false,
        whatsappIntegration: false,
        emailMarketing: false,
      },
      limits: {
        maxUsers: 1,
        maxItems: 50,
        maxOrdersPerMonth: 100,
        aiScansPerMonth: 0,
        aiImagesPerMonth: 0,
      },
      pricing: {
        monthly: { amount: 0, currency: "INR" },
        yearly: { amount: 0, currency: "INR" },
      },
    },
    pro: {
      features: {
        maxUsers: 5,
        maxItems: 500,
        maxOrders: 1000,
        aiMenuScanning: true,
        aiImageGeneration: true,
        advancedReports: true,
        loyaltyProgram: true,
        inventoryManagement: true,
        expenseTracking: true,
        printerIntegration: true,
        customBranding: false,
        apiAccess: false,
        prioritySupport: false,
        whatsappIntegration: true,
        emailMarketing: true,
      },
      limits: {
        maxUsers: 5,
        maxItems: 500,
        maxOrdersPerMonth: 1000,
        aiScansPerMonth: 20,
        aiImagesPerMonth: 50,
      },
      pricing: {
        monthly: { amount: 1999, currency: "INR" },
        yearly: { amount: 19990, currency: "INR" }, // ~17% discount
      },
    },
    enterprise: {
      features: {
        maxUsers: 999,
        maxItems: 9999,
        maxOrders: 99999,
        aiMenuScanning: true,
        aiImageGeneration: true,
        advancedReports: true,
        loyaltyProgram: true,
        inventoryManagement: true,
        expenseTracking: true,
        printerIntegration: true,
        customBranding: true,
        apiAccess: true,
        prioritySupport: true,
        whatsappIntegration: true,
        emailMarketing: true,
      },
      limits: {
        maxUsers: 999,
        maxItems: 9999,
        maxOrdersPerMonth: 99999,
        aiScansPerMonth: 999,
        aiImagesPerMonth: 999,
      },
      pricing: {
        monthly: { amount: 9999, currency: "INR" },
        yearly: { amount: 99990, currency: "INR" }, // ~17% discount
      },
    },
  };

  return configs[tier];
};

export default mongoose.model<ISubscription, ISubscriptionModel>(
  "Subscription",
  SubscriptionSchema
);
