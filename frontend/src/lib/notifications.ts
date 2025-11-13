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

    // Check if service worker is registered
    if (!("serviceWorker" in navigator)) {
      console.log("Service workers are not supported");
      return false;
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // TS: DOM lib expects BufferSource; cast the Uint8Array to any to satisfy type
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
          "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U"
      ) as any,
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
    if (!("serviceWorker" in navigator)) {
      return true;
    }

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

export async function getNotificationStatus(): Promise<{
  permission: NotificationPermission;
  subscribed: boolean;
}> {
  if (!("Notification" in window)) {
    return { permission: "denied", subscribed: false };
  }

  const permission = Notification.permission;
  let subscribed = false;

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      subscribed = !!subscription;
    }
  } catch (error) {
    console.error("Error checking subscription status:", error);
  }

  return { permission, subscribed };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
