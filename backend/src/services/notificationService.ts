import { messaging } from "../config/firebaseAdmin";
import PushSubscription from "../models/PushSubscription";
import NotificationPreferences from "../models/NotificationPreferences";

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{ action: string; title: string }>;
}

class NotificationService {
  /**
   * Send push notification to specific users
   */
  async sendToUsers(
    userIds: string[],
    notificationType: string,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      if (!messaging) {
        console.log(
          "Firebase messaging not initialized, skipping notification"
        );
        return;
      }

      // Get users who have this notification enabled
      const preferences = await NotificationPreferences.find({
        userId: { $in: userIds },
        [`preferences.${notificationType}`]: true,
      });

      const enabledUserIds = preferences.map((p) => p.userId.toString());

      if (enabledUserIds.length === 0) {
        console.log("No users have this notification type enabled");
        return;
      }

      // Get active subscriptions for these users
      const subscriptions = await PushSubscription.find({
        userId: { $in: enabledUserIds },
        isActive: true,
      });

      if (subscriptions.length === 0) {
        console.log("No active subscriptions found");
        return;
      }

      // Send notifications
      const promises = subscriptions.map((sub) =>
        this.sendNotification(sub.endpoint, payload)
      );

      await Promise.allSettled(promises);
    } catch (error) {
      console.error("Error sending notifications:", error);
      throw error;
    }
  }

  /**
   * Send push notification to all users in an outlet
   */
  async sendToOutlet(
    outletId: string,
    notificationType: string,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      if (!messaging) {
        console.log(
          "Firebase messaging not initialized, skipping notification"
        );
        return;
      }

      // Get users who have this notification enabled for this outlet
      const preferences = await NotificationPreferences.find({
        outletId,
        [`preferences.${notificationType}`]: true,
      });

      const enabledUserIds = preferences.map((p) => p.userId.toString());

      if (enabledUserIds.length === 0) {
        console.log("No users have this notification type enabled for outlet");
        return;
      }

      // Get active subscriptions
      const subscriptions = await PushSubscription.find({
        userId: { $in: enabledUserIds },
        outletId,
        isActive: true,
      });

      if (subscriptions.length === 0) {
        console.log("No active subscriptions found for outlet");
        return;
      }

      // Send notifications
      const promises = subscriptions.map((sub) =>
        this.sendNotification(sub.endpoint, payload)
      );

      await Promise.allSettled(promises);
    } catch (error) {
      console.error("Error sending outlet notifications:", error);
      throw error;
    }
  }

  /**
   * Send individual notification using FCM
   */
  private async sendNotification(
    endpoint: string,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      if (!messaging) {
        console.log("Firebase messaging not initialized");
        return;
      }

      // Extract FCM token from endpoint
      const token = this.extractTokenFromEndpoint(endpoint);

      if (!token) {
        console.error("Invalid endpoint format:", endpoint);
        return;
      }

      // Prepare FCM message
      const message = {
        token,
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "/icon-192x192.png",
        },
        data: payload.data || {},
        webpush: {
          notification: {
            badge: payload.badge || "/badge-72x72.png",
            ...(payload.actions && { actions: payload.actions }),
          },
        },
      };

      // Send via FCM
      await messaging.send(message);
      console.log("Notification sent successfully");
    } catch (error: any) {
      console.error("Error sending individual notification:", error);

      // If token is invalid, mark subscription as inactive
      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        await PushSubscription.updateOne({ endpoint }, { isActive: false });
      }
    }
  }

  /**
   * Extract FCM token from endpoint URL
   */
  private extractTokenFromEndpoint(endpoint: string): string | null {
    // FCM endpoint format: https://fcm.googleapis.com/fcm/send/{token}
    const match = endpoint.match(/\/fcm\/send\/(.+)$/);
    return match ? match[1] : null;
  }
}

export default new NotificationService();
