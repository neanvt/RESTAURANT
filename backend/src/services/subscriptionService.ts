import Subscription, {
  ISubscription,
  SubscriptionTier,
  BillingCycle,
} from "../models/Subscription";
import User from "../models/User";
import Item from "../models/Item";
import Order from "../models/Order";
import mongoose from "mongoose";

export class SubscriptionService {
  /**
   * Create a new subscription for an outlet (typically free trial)
   */
  async createSubscription(
    outletId: string,
    tier: SubscriptionTier = "free",
    billingCycle: BillingCycle = "monthly",
    trialDays: number = 14
  ): Promise<ISubscription> {
    // Check if subscription already exists
    const existing = await Subscription.findOne({ outlet: outletId });
    if (existing) {
      throw new Error("Subscription already exists for this outlet");
    }

    const config = (Subscription as any).getTierConfig(tier);
    const now = new Date();
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
    const periodEnd = tier === "free" ? new Date("2099-12-31") : trialEnd;

    const subscription = new Subscription({
      outlet: outletId,
      tier,
      status: tier === "free" ? "active" : "trialing",
      billingCycle,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      trialStart: tier !== "free" ? now : undefined,
      trialEnd: tier !== "free" ? trialEnd : undefined,
      features: config.features,
      limits: config.limits,
      pricing: config.pricing[billingCycle],
      usage: {
        users: 0,
        items: 0,
        orders: 0,
        aiScans: 0,
        aiImages: 0,
      },
    });

    await subscription.save();
    await this.syncUsageFromDatabase(outletId);

    return subscription;
  }

  /**
   * Get subscription by outlet ID
   */
  async getSubscriptionByOutlet(
    outletId: string
  ): Promise<ISubscription | null> {
    return await Subscription.findOne({ outlet: outletId });
  }

  /**
   * Upgrade subscription tier
   */
  async upgradeTier(
    outletId: string,
    newTier: SubscriptionTier,
    billingCycle: BillingCycle = "monthly"
  ): Promise<ISubscription> {
    const subscription = await this.getSubscriptionByOutlet(outletId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Validate upgrade path
    const tierOrder = { free: 0, pro: 1, enterprise: 2 };
    if (tierOrder[newTier] <= tierOrder[subscription.tier]) {
      throw new Error("Can only upgrade to a higher tier");
    }

    const config = (Subscription as any).getTierConfig(newTier);
    const now = new Date();

    subscription.tier = newTier;
    subscription.status = "active";
    subscription.billingCycle = billingCycle;
    subscription.features = config.features;
    subscription.limits = config.limits;
    subscription.pricing = config.pricing[billingCycle];
    subscription.currentPeriodStart = now;

    // Set next billing date based on cycle
    const daysToAdd = billingCycle === "monthly" ? 30 : 365;
    subscription.currentPeriodEnd = new Date(
      now.getTime() + daysToAdd * 24 * 60 * 60 * 1000
    );

    // Clear trial dates
    subscription.trialStart = undefined;
    subscription.trialEnd = undefined;

    await subscription.save();
    return subscription;
  }

  /**
   * Downgrade subscription tier
   */
  async downgradeTier(
    outletId: string,
    newTier: SubscriptionTier
  ): Promise<ISubscription> {
    const subscription = await this.getSubscriptionByOutlet(outletId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const config = (Subscription as any).getTierConfig(newTier);

    subscription.tier = newTier;
    subscription.features = config.features;
    subscription.limits = config.limits;
    subscription.pricing = config.pricing[subscription.billingCycle];

    await subscription.save();
    return subscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(outletId: string): Promise<ISubscription> {
    const subscription = await this.getSubscriptionByOutlet(outletId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    subscription.status = "canceled";
    subscription.canceledAt = new Date();

    await subscription.save();
    return subscription;
  }

  /**
   * Reactivate canceled subscription
   */
  async reactivateSubscription(outletId: string): Promise<ISubscription> {
    const subscription = await this.getSubscriptionByOutlet(outletId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== "canceled") {
      throw new Error("Can only reactivate canceled subscriptions");
    }

    const now = new Date();
    const daysToAdd = subscription.billingCycle === "monthly" ? 30 : 365;

    subscription.status = "active";
    subscription.canceledAt = undefined;
    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd = new Date(
      now.getTime() + daysToAdd * 24 * 60 * 60 * 1000
    );

    await subscription.save();
    return subscription;
  }

  /**
   * Check if outlet can use a specific feature
   */
  async canUseFeature(outletId: string, feature: string): Promise<boolean> {
    const subscription = await this.getSubscriptionByOutlet(outletId);
    if (!subscription) {
      return false;
    }

    return subscription.canUseFeature(feature);
  }

  /**
   * Check if outlet has reached a usage limit
   */
  async hasReachedLimit(outletId: string, metric: string): Promise<boolean> {
    const subscription = await this.getSubscriptionByOutlet(outletId);
    if (!subscription) {
      return true; // No subscription = limit reached
    }

    return subscription.hasReachedLimit(metric);
  }

  /**
   * Increment usage counter
   */
  async incrementUsage(
    outletId: string,
    metric: string,
    amount: number = 1
  ): Promise<void> {
    const subscription = await this.getSubscriptionByOutlet(outletId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    await subscription.incrementUsage(metric, amount);
  }

  /**
   * Get remaining quota for a metric
   */
  async getRemainingQuota(outletId: string, metric: string): Promise<number> {
    const subscription = await this.getSubscriptionByOutlet(outletId);
    if (!subscription) {
      return 0;
    }

    return subscription.getRemainingQuota(metric);
  }

  /**
   * Sync usage from database (users, items, orders)
   */
  async syncUsageFromDatabase(outletId: string): Promise<void> {
    const subscription = await this.getSubscriptionByOutlet(outletId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Count users
    const userCount = await User.countDocuments({
      outlets: new mongoose.Types.ObjectId(outletId),
    });

    // Count items
    const itemCount = await Item.countDocuments({
      outlet: new mongoose.Types.ObjectId(outletId),
    });

    // Count orders this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const orderCount = await Order.countDocuments({
      outlet: new mongoose.Types.ObjectId(outletId),
      createdAt: { $gte: startOfMonth },
    });

    subscription.usage.users = userCount;
    subscription.usage.items = itemCount;
    subscription.usage.orders = orderCount;

    await subscription.save();
  }

  /**
   * Reset monthly usage counters (for recurring billing)
   */
  async resetMonthlyUsage(outletId: string): Promise<void> {
    const subscription = await this.getSubscriptionByOutlet(outletId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    await subscription.resetMonthlyUsage();
  }

  /**
   * Handle subscription renewal
   */
  async renewSubscription(outletId: string): Promise<ISubscription> {
    const subscription = await this.getSubscriptionByOutlet(outletId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const now = new Date();
    const daysToAdd = subscription.billingCycle === "monthly" ? 30 : 365;

    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd = new Date(
      now.getTime() + daysToAdd * 24 * 60 * 60 * 1000
    );
    subscription.status = "active";

    // Reset monthly usage
    await subscription.resetMonthlyUsage();

    await subscription.save();
    return subscription;
  }

  /**
   * Check and expire subscriptions
   */
  async checkExpiredSubscriptions(): Promise<void> {
    const now = new Date();
    const expiredSubs = await Subscription.find({
      currentPeriodEnd: { $lt: now },
      status: { $in: ["active", "trialing", "past_due"] },
    });

    for (const sub of expiredSubs) {
      if (sub.tier === "free") {
        // Free tier never expires
        continue;
      }

      if (sub.status === "trialing") {
        // Trial expired, downgrade to free
        const config = (Subscription as any).getTierConfig("free");
        sub.tier = "free";
        sub.status = "active";
        sub.features = config.features;
        sub.limits = config.limits;
        sub.pricing = config.pricing.monthly;
        sub.currentPeriodEnd = new Date("2099-12-31");
      } else {
        // Paid subscription expired
        sub.status = "expired";
      }

      await sub.save();
    }
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats(outletId: string): Promise<any> {
    const subscription = await this.getSubscriptionByOutlet(outletId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const usagePercentages = {
      users: (subscription.usage.users / subscription.limits.maxUsers) * 100,
      items: (subscription.usage.items / subscription.limits.maxItems) * 100,
      orders:
        (subscription.usage.orders / subscription.limits.maxOrdersPerMonth) *
        100,
      aiScans:
        subscription.limits.aiScansPerMonth > 0
          ? (subscription.usage.aiScans / subscription.limits.aiScansPerMonth) *
            100
          : 0,
      aiImages:
        subscription.limits.aiImagesPerMonth > 0
          ? (subscription.usage.aiImages /
              subscription.limits.aiImagesPerMonth) *
            100
          : 0,
    };

    const daysRemaining = Math.ceil(
      (subscription.currentPeriodEnd.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return {
      tier: subscription.tier,
      status: subscription.status,
      billingCycle: subscription.billingCycle,
      currentPeriodEnd: subscription.currentPeriodEnd,
      daysRemaining,
      isTrialing: subscription.isTrialing(),
      usage: subscription.usage,
      limits: subscription.limits,
      usagePercentages,
      features: subscription.features,
      pricing: subscription.pricing,
    };
  }

  /**
   * Get all available tiers with configurations
   */
  getTierConfigurations(): any {
    return {
      free: (Subscription as any).getTierConfig("free"),
      pro: (Subscription as any).getTierConfig("pro"),
      enterprise: (Subscription as any).getTierConfig("enterprise"),
    };
  }

  /**
   * Get upgrade options for current tier
   */
  async getUpgradeOptions(outletId: string): Promise<any[]> {
    const subscription = await this.getSubscriptionByOutlet(outletId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }

    const tierOrder = ["free", "pro", "enterprise"];
    const currentTierIndex = tierOrder.indexOf(subscription.tier);
    const availableTiers = tierOrder.slice(currentTierIndex + 1);

    return availableTiers.map((tier) => {
      const config = (Subscription as any).getTierConfig(tier);
      return {
        tier,
        features: config.features,
        limits: config.limits,
        pricing: config.pricing,
      };
    });
  }
}

export default new SubscriptionService();
