import { Request, Response, NextFunction } from "express";
import subscriptionService from "../services/subscriptionService";

/**
 * Middleware to check if a feature is available in the current subscription
 */
export const requireFeature = (featureName: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const outletId = (req as any).currentOutlet || (req as any).outletId;

      if (!outletId) {
        res.status(400).json({
          success: false,
          error: {
            code: "NO_OUTLET",
            message: "No outlet context found",
          },
        });
        return;
      }

      const canUse = await subscriptionService.canUseFeature(
        outletId,
        featureName
      );

      if (!canUse) {
        res.status(403).json({
          success: false,
          error: {
            code: "FEATURE_LOCKED",
            message: `This feature requires a premium subscription`,
            feature: featureName,
            upgradeRequired: true,
          },
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "FEATURE_CHECK_ERROR",
          message: error.message || "Failed to check feature availability",
        },
      });
    }
  };
};

/**
 * Middleware to check usage limits
 */
export const checkUsageLimit = (metric: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const outletId = (req as any).currentOutlet || (req as any).outletId;

      if (!outletId) {
        res.status(400).json({
          success: false,
          error: {
            code: "NO_OUTLET",
            message: "No outlet context found",
          },
        });
        return;
      }

      const hasReached = await subscriptionService.hasReachedLimit(
        outletId,
        metric
      );

      if (hasReached) {
        const subscription = await subscriptionService.getSubscriptionByOutlet(
          outletId
        );
        res.status(403).json({
          success: false,
          error: {
            code: "USAGE_LIMIT_REACHED",
            message: `You have reached your ${metric} limit for this billing period`,
            metric,
            limit:
              subscription?.limits[
                `max${
                  metric.charAt(0).toUpperCase() + metric.slice(1)
                }` as keyof typeof subscription.limits
              ],
            upgradeRequired: true,
          },
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "LIMIT_CHECK_ERROR",
          message: error.message || "Failed to check usage limit",
        },
      });
    }
  };
};

/**
 * Middleware to increment usage after successful operation
 */
export const incrementUsage = (metric: string, amount: number = 1) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const outletId = (req as any).currentOutlet || (req as any).outletId;

      if (outletId) {
        // Increment usage after response is sent
        res.on("finish", async () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              await subscriptionService.incrementUsage(
                outletId,
                metric,
                amount
              );
            } catch (error) {
              console.error(`Failed to increment ${metric} usage:`, error);
            }
          }
        });
      }

      next();
    } catch (error: any) {
      // Don't fail the request if usage increment fails
      console.error("Error in incrementUsage middleware:", error);
      next();
    }
  };
};

/**
 * Middleware to check if subscription is active
 */
export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const outletId = (req as any).currentOutlet || (req as any).outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_OUTLET",
          message: "No outlet context found",
        },
      });
      return;
    }

    const subscription = await subscriptionService.getSubscriptionByOutlet(
      outletId
    );

    if (!subscription || !subscription.isActive()) {
      res.status(403).json({
        success: false,
        error: {
          code: "SUBSCRIPTION_INACTIVE",
          message:
            "Your subscription is not active. Please upgrade or reactivate your subscription.",
          subscriptionStatus: subscription?.status || "not_found",
        },
      });
      return;
    }

    next();
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: "SUBSCRIPTION_CHECK_ERROR",
        message: error.message || "Failed to check subscription status",
      },
    });
  }
};

/**
 * Middleware to check minimum subscription tier
 */
export const requireTier = (minimumTier: "free" | "pro" | "enterprise") => {
  const tierOrder = { free: 0, pro: 1, enterprise: 2 };

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const outletId = (req as any).currentOutlet || (req as any).outletId;

      if (!outletId) {
        res.status(400).json({
          success: false,
          error: {
            code: "NO_OUTLET",
            message: "No outlet context found",
          },
        });
        return;
      }

      const subscription = await subscriptionService.getSubscriptionByOutlet(
        outletId
      );

      if (!subscription) {
        res.status(403).json({
          success: false,
          error: {
            code: "NO_SUBSCRIPTION",
            message: "No subscription found",
            upgradeRequired: true,
          },
        });
        return;
      }

      const currentTierLevel = tierOrder[subscription.tier];
      const requiredTierLevel = tierOrder[minimumTier];

      if (currentTierLevel < requiredTierLevel) {
        res.status(403).json({
          success: false,
          error: {
            code: "TIER_UPGRADE_REQUIRED",
            message: `This feature requires ${minimumTier} tier or higher`,
            currentTier: subscription.tier,
            requiredTier: minimumTier,
            upgradeRequired: true,
          },
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: "TIER_CHECK_ERROR",
          message: error.message || "Failed to check subscription tier",
        },
      });
    }
  };
};
