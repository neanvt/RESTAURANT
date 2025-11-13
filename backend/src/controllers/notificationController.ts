import { Request, Response } from "express";
import mongoose from "mongoose";
import PushSubscription from "../models/PushSubscription";
import NotificationPreferences from "../models/NotificationPreferences";

export class NotificationController {
  /**
   * Subscribe to push notifications
   * POST /api/notifications/subscribe
   */
  async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const { subscription } = req.body;
      const userId = req.user!.userId;
      const outletId = req.outletId;

      if (!subscription || !subscription.endpoint) {
        res.status(400).json({
          success: false,
          error: { message: "Invalid subscription data" },
        });
        return;
      }

      // Check if subscription already exists
      const existingSubscription = await PushSubscription.findOne({
        endpoint: subscription.endpoint,
      });

      if (existingSubscription) {
        // Update existing subscription
        existingSubscription.isActive = true;
        existingSubscription.userId = new mongoose.Types.ObjectId(userId);
        existingSubscription.outletId = new mongoose.Types.ObjectId(outletId!);
        await existingSubscription.save();
      } else {
        // Create new subscription
        await PushSubscription.create({
          userId: new mongoose.Types.ObjectId(userId),
          outletId: new mongoose.Types.ObjectId(outletId!),
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          deviceInfo: {
            userAgent: req.get("user-agent") || "",
            platform: req.body.platform || "unknown",
          },
          isActive: true,
        });
      }

      res.json({
        success: true,
        message: "Subscribed to push notifications",
      });
    } catch (error: any) {
      console.error("Subscribe error:", error);
      res.status(500).json({
        success: false,
        error: { message: "Failed to subscribe" },
      });
    }
  }

  /**
   * Unsubscribe from push notifications
   * POST /api/notifications/unsubscribe
   */
  async unsubscribe(req: Request, res: Response): Promise<void> {
    try {
      const { endpoint } = req.body;

      if (!endpoint) {
        res.status(400).json({
          success: false,
          error: { message: "Endpoint is required" },
        });
        return;
      }

      await PushSubscription.updateOne({ endpoint }, { isActive: false });

      res.json({
        success: true,
        message: "Unsubscribed from push notifications",
      });
    } catch (error: any) {
      console.error("Unsubscribe error:", error);
      res.status(500).json({
        success: false,
        error: { message: "Failed to unsubscribe" },
      });
    }
  }

  /**
   * Get notification preferences
   * GET /api/notifications/preferences
   */
  async getPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const outletId = req.outletId;

      let preferences = await NotificationPreferences.findOne({
        userId,
        outletId,
      });

      if (!preferences) {
        // Create default preferences
        preferences = await NotificationPreferences.create({
          userId,
          outletId,
          preferences: {
            new_orders: true,
            order_completed: true,
            low_stock: true,
            daily_summary: false,
            customer_feedback: false,
          },
        });
      }

      res.json({
        success: true,
        data: preferences,
      });
    } catch (error: any) {
      console.error("Get preferences error:", error);
      res.status(500).json({
        success: false,
        error: { message: "Failed to get preferences" },
      });
    }
  }

  /**
   * Update notification preferences
   * PUT /api/notifications/preferences
   */
  async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const outletId = req.outletId;
      const { preferences } = req.body;

      if (!preferences) {
        res.status(400).json({
          success: false,
          error: { message: "Preferences are required" },
        });
        return;
      }

      const updated = await NotificationPreferences.findOneAndUpdate(
        { userId, outletId },
        { preferences },
        { new: true, upsert: true }
      );

      res.json({
        success: true,
        data: updated,
        message: "Preferences updated successfully",
      });
    } catch (error: any) {
      console.error("Update preferences error:", error);
      res.status(500).json({
        success: false,
        error: { message: "Failed to update preferences" },
      });
    }
  }
}

export default new NotificationController();
