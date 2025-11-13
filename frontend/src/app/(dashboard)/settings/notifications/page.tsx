"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Bell,
  Mail,
  MessageSquare,
  Package,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface NotificationSetting {
  id: string;
  icon: any;
  title: string;
  description: string;
  enabled: boolean;
  color: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: "new_orders",
      icon: Bell,
      title: "New Orders",
      description: "Get notified when a new order is placed",
      enabled: true,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "order_completed",
      icon: Package,
      title: "Order Completed",
      description: "Notification when an order is completed",
      enabled: true,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "low_stock",
      icon: AlertCircle,
      title: "Low Stock Alerts",
      description: "Alert when inventory items are running low",
      enabled: true,
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: "daily_summary",
      icon: Mail,
      title: "Daily Summary",
      description: "Receive daily sales summary via email",
      enabled: false,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "customer_feedback",
      icon: MessageSquare,
      title: "Customer Feedback",
      description: "Notification for new customer reviews",
      enabled: false,
      color: "bg-pink-100 text-pink-600",
    },
  ]);

  const handleToggle = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, enabled: !n.enabled } : n
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real implementation, this would save to backend
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Notification preferences updated!");
      router.push("/settings");
    } catch (error: any) {
      toast.error("Failed to update notification preferences");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-600">
                Manage notification preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Settings</CardTitle>
            <p className="text-sm text-gray-600">
              Choose which notifications you want to receive
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className="flex items-start justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {notification.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">
                        {notification.description}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={notification.enabled}
                    onCheckedChange={() => handleToggle(notification.id)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              📱 Push Notifications
            </h3>
            <p className="text-sm text-blue-800">
              Make sure to enable push notifications in your device settings to
              receive real-time alerts about your restaurant operations.
            </p>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-white border-t p-4 -mx-4">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
