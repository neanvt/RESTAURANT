# Push Notifications Backend Integration Guide

## Overview

This guide explains how to integrate push notifications with Firebase Cloud Messaging (FCM) for the Restaurant Management System.

## Prerequisites

- Firebase project with Cloud Messaging enabled
- Service account key from Firebase Console
- `firebase-admin` npm package

## Step 1: Install Required Packages

```bash
cd backend
npm install firebase-admin
npm install web-push
```

## Step 2: Configure Firebase Admin SDK

### 2.1 Get Firebase Service Account Key

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `firebase-service-account.json` in `backend/` directory
4. Add to `.gitignore`:

```
firebase-service-account.json
```

### 2.2 Create Firebase Admin Config

**File: `backend/src/config/firebaseAdmin.ts`**

```typescript
import * as admin from "firebase-admin";
import * as path from "path";

// Initialize Firebase Admin
const serviceAccount = require(path.join(
  __dirname,
  "../../firebase-service-account.json"
));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const messaging = admin.messaging();
export default admin;
```

## Step 3: Create Push Notification Models

### 3.1 Push Subscription Model

**File: `backend/src/models/PushSubscription.ts`**

```typescript
import mongoose, { Document, Schema } from "mongoose";

export interface IPushSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  outletId: mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceInfo?: {
    userAgent: string;
    platform: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    deviceInfo: {
      userAgent: String,
      platform: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
PushSubscriptionSchema.index({ userId: 1, outletId: 1 });
PushSubscriptionSchema.index({ isActive: 1 });

export default mongoose.model<IPushSubscription>(
  "PushSubscription",
  PushSubscriptionSchema
);
```

### 3.2 Notification Preferences Model

**File: `backend/src/models/NotificationPreferences.ts`**

```typescript
import mongoose, { Document, Schema } from "mongoose";

export interface INotificationPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  outletId: mongoose.Types.ObjectId;
  preferences: {
    new_orders: boolean;
    order_completed: boolean;
    low_stock: boolean;
    daily_summary: boolean;
    customer_feedback: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
    },
    preferences: {
      new_orders: { type: Boolean, default: true },
      order_completed: { type: Boolean, default: true },
      low_stock: { type: Boolean, default: true },
      daily_summary: { type: Boolean, default: false },
      customer_feedback: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Unique constraint
NotificationPreferencesSchema.index(
  { userId: 1, outletId: 1 },
  { unique: true }
);

export default mongoose.model<INotificationPreferences>(
  "NotificationPreferences",
  NotificationPreferencesSchema
);
```

## Step 4: Create Notification Service

**File: `backend/src/services/notificationService.ts`**

```typescript
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
      // Get users who have this notification enabled
      const preferences = await NotificationPreferences.find({
        userId: { $in: userIds },
        [`preferences.${notificationType}`]: true,
      });

      const enabledUserIds = preferences.map((p) => p.userId.toString());

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
      // Get users who have this notification enabled for this outlet
      const preferences = await NotificationPreferences.find({
        outletId,
        [`preferences.${notificationType}`]: true,
      });

      const enabledUserIds = preferences.map((p) => p.userId.toString());

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
      // Extract FCM token from endpoint
      const token = this.extractTokenFromEndpoint(endpoint);

      if (!token) {
        console.error("Invalid endpoint format");
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
            actions: payload.actions || [],
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
```

## Step 5: Create API Controllers

**File: `backend/src/controllers/notificationController.ts`**

```typescript
import { Request, Response } from "express";
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
        existingSubscription.userId = userId;
        existingSubscription.outletId = outletId!;
        await existingSubscription.save();
      } else {
        // Create new subscription
        await PushSubscription.create({
          userId,
          outletId,
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

      const updated = await NotificationPreferences.findOneAndUpdate(
        { userId, outletId },
        { preferences },
        { new: true, upsert: true }
      );

      res.json({
        success: true,
        data: updated,
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
```

## Step 6: Create API Routes

**File: `backend/src/routes/notificationRoutes.ts`**

```typescript
import { Router } from "express";
import notificationController from "../controllers/notificationController";
import { authenticate } from "../middleware/authMiddleware";
import { outletMiddleware } from "../middleware/outletMiddleware";

const router = Router();

// All routes require authentication and outlet selection
router.use(authenticate);
router.use(outletMiddleware);

// Subscribe/Unsubscribe
router.post("/subscribe", notificationController.subscribe);
router.post("/unsubscribe", notificationController.unsubscribe);

// Preferences
router.get("/preferences", notificationController.getPreferences);
router.put("/preferences", notificationController.updatePreferences);

export default router;
```

## Step 7: Register Routes in Main App

**File: `backend/src/app.ts`** (add this line)

```typescript
import notificationRoutes from "./routes/notificationRoutes";

// ... other imports and code

app.use("/api/notifications", notificationRoutes);
```

## Step 8: Integrate Notifications in Controllers

### Example: Send notification when order is created

**File: `backend/src/controllers/orderController.ts`** (add after order creation)

```typescript
import notificationService from "../services/notificationService";

// After creating order
await notificationService.sendToOutlet(outletId.toString(), "new_orders", {
  title: "New Order",
  body: `Order #${orderNumber} received`,
  icon: "/icon-192x192.png",
  data: {
    orderId: order._id.toString(),
    orderNumber,
    type: "new_order",
  },
  actions: [
    { action: "view", title: "View Order" },
    { action: "close", title: "Close" },
  ],
});
```

## Step 9: Frontend Integration

### 9.1 Create Notification Service

**File: `frontend/src/lib/notifications.ts`**

```typescript
import { getAccessToken } from "./auth-token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export async function subscribeToNotifications(): Promise<boolean> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return false;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
      ),
    });

    // Send subscription to backend
    const token = getAccessToken();
    const response = await fetch(`${API_URL}/api/notifications/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        platform: navigator.platform,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to subscribe");
    }

    return true;
  } catch (error) {
    console.error("Error subscribing to notifications:", error);
    return false;
  }
}

export async function unsubscribeFromNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return true;
    }

    // Unsubscribe from push manager
    await subscription.unsubscribe();

    // Notify backend
    const token = getAccessToken();
    await fetch(`${API_URL}/api/notifications/unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    });

    return true;
  } catch (error) {
    console.error("Error unsubscribing from notifications:", error);
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

### 9.2 Update Notifications Settings Page

Add notification subscription toggle and save preferences to backend.

## Step 10: Service Worker for Handling Notifications

**File: `frontend/public/sw.js`** (if not using next-pwa's generated one)

```javascript
self.addEventListener("push", function (event) {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192x192.png",
    badge: "/badge-72x72.png",
    data: data.data,
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "view") {
    // Handle view action
    const orderId = event.notification.data.orderId;
    event.waitUntil(clients.openWindow(`/orders/${orderId}`));
  }
});
```

## Step 11: Environment Variables

Add to **`backend/.env`**:

```env
# Firebase Admin SDK will use the service account JSON file
```

Add to **`frontend/.env.local`**:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

## Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login to the app
4. Go to Settings → Notifications
5. Enable notification permissions
6. Toggle notification preferences
7. Create a test order to trigger notification

## Production Deployment

1. Ensure Firebase service account key is securely stored
2. Set up proper VAPID keys for web push
3. Configure HTTPS (required for service workers)
4. Test on different devices and browsers

## Troubleshooting

- **Notifications not showing**: Check browser permissions
- **Service worker not registering**: Ensure HTTPS is enabled
- **FCM errors**: Verify Firebase configuration and service account
- **Subscription failing**: Check VAPID keys and endpoint configuration

---

For more details, refer to:

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
