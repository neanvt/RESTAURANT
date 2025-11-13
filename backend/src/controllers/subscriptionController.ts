import { Request, Response } from "express";
import subscriptionService from "../services/subscriptionService";

export class SubscriptionController {
  /**
   * Get subscription for current outlet
   */
  async getSubscription(req: Request, res: Response): Promise<void> {
    try {
      const outletId = (req as any).currentOutlet;

      if (!outletId) {
        res.status(400).json({
          success: false,
          message: "No outlet context found",
        });
        return;
      }

      const subscription = await subscriptionService.getSubscriptionByOutlet(
        outletId
      );

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: subscription,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch subscription",
      });
    }
  }

  /**
   * Create subscription (usually done automatically on outlet creation)
   */
  async createSubscription(req: Request, res: Response): Promise<void> {
    try {
      const outletId = (req as any).currentOutlet;
      const {
        tier = "free",
        billingCycle = "monthly",
        trialDays = 14,
      } = req.body;

      if (!outletId) {
        res.status(400).json({
          success: false,
          message: "No outlet context found",
        });
        return;
      }

      const subscription = await subscriptionService.createSubscription(
        outletId,
        tier,
        billingCycle,
        trialDays
      );

      res.status(201).json({
        success: true,
        message: "Subscription created successfully",
        data: subscription,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create subscription",
      });
    }
  }

  /**
   * Upgrade subscription tier
   */
  async upgradeTier(req: Request, res: Response): Promise<void> {
    try {
      const outletId = (req as any).currentOutlet;
      const { tier, billingCycle = "monthly" } = req.body;

      if (!outletId) {
        res.status(400).json({
          success: false,
          message: "No outlet context found",
        });
        return;
      }

      if (!tier) {
        res.status(400).json({
          success: false,
          message: "Tier is required",
        });
        return;
      }

      const subscription = await subscriptionService.upgradeTier(
        outletId,
        tier,
        billingCycle
      );

      res.status(200).json({
        success: true,
        message: `Subscription upgraded to ${tier} tier`,
        data: subscription,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upgrade subscription",
      });
    }
  }

  /**
   * Downgrade subscription tier
   */
  async downgradeTier(req: Request, res: Response): Promise<void> {
    try {
      const outletId = (req as any).currentOutlet;
      const { tier } = req.body;

      if (!outletId) {
        res.status(400).json({
          success: false,
          message: "No outlet context found",
        });
        return;
      }

      if (!tier) {
        res.status(400).json({
          success: false,
          message: "Tier is required",
        });
        return;
      }

      const subscription = await subscriptionService.downgradeTier(
        outletId,
        tier
      );

      res.status(200).json({
        success: true,
        message: `Subscription downgraded to ${tier} tier`,
        data: subscription,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to downgrade subscription",
      });
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const outletId = (req as any).currentOutlet;

      if (!outletId) {
        res.status(400).json({
          success: false,
          message: "No outlet context found",
        });
        return;
      }

      const subscription = await subscriptionService.cancelSubscription(
        outletId
      );

      res.status(200).json({
        success: true,
        message: "Subscription canceled successfully",
        data: subscription,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to cancel subscription",
      });
    }
  }

  /**
   * Reactivate canceled subscription
   */
  async reactivateSubscription(req: Request, res: Response): Promise<void> {
    try {
      const outletId = (req as any).currentOutlet;

      if (!outletId) {
        res.status(400).json({
          success: false,
          message: "No outlet context found",
        });
        return;
      }

      const subscription = await subscriptionService.reactivateSubscription(
        outletId
      );

      res.status(200).json({
        success: true,
        message: "Subscription reactivated successfully",
        data: subscription,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to reactivate subscription",
      });
    }
  }

  /**
   * Check if feature is available
   */
  async checkFeature(req: Request, res: Response): Promise<void> {
    try {
      const outletId = (req as any).currentOutlet;
      const { feature } = req.params;

      if (!outletId) {
        res.status(400).json({
          success: false,
          message: "No outlet context found",
        });
        return;
      }

      const canUse = await subscriptionService.canUseFeature(outletId, feature);

      res.status(200).json({
        success: true,
        data: {
          feature,
          available: canUse,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to check feature availability",
      });
    }
  }

  /**
   * Get subscription statistics
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const outletId = (req as any).currentOutlet;

      if (!outletId) {
        res.status(400).json({
          success: false,
          message: "No outlet context found",
        });
        return;
      }

      const stats = await subscriptionService.getSubscriptionStats(outletId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch subscription stats",
      });
    }
  }

  /**
   * Get all tier configurations
   */
  async getTierConfigurations(_req: Request, res: Response): Promise<void> {
    try {
      const configs = subscriptionService.getTierConfigurations();

      res.status(200).json({
        success: true,
        data: configs,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch tier configurations",
      });
    }
  }

  /**
   * Get upgrade options
   */
  async getUpgradeOptions(req: Request, res: Response): Promise<void> {
    try {
      const outletId = (req as any).currentOutlet;

      if (!outletId) {
        res.status(400).json({
          success: false,
          message: "No outlet context found",
        });
        return;
      }

      const options = await subscriptionService.getUpgradeOptions(outletId);

      res.status(200).json({
        success: true,
        data: options,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch upgrade options",
      });
    }
  }

  /**
   * Sync usage from database
   */
  async syncUsage(req: Request, res: Response): Promise<void> {
    try {
      const outletId = (req as any).currentOutlet;

      if (!outletId) {
        res.status(400).json({
          success: false,
          message: "No outlet context found",
        });
        return;
      }

      await subscriptionService.syncUsageFromDatabase(outletId);

      res.status(200).json({
        success: true,
        message: "Usage synced successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to sync usage",
      });
    }
  }

  /**
   * Get remaining quota for a metric
   */
  async getRemainingQuota(req: Request, res: Response): Promise<void> {
    try {
      const outletId = (req as any).currentOutlet;
      const { metric } = req.params;

      if (!outletId) {
        res.status(400).json({
          success: false,
          message: "No outlet context found",
        });
        return;
      }

      const remaining = await subscriptionService.getRemainingQuota(
        outletId,
        metric
      );

      res.status(200).json({
        success: true,
        data: {
          metric,
          remaining,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get remaining quota",
      });
    }
  }
}

export default new SubscriptionController();
