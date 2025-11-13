"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Crown,
  TrendingUp,
  Calendar,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SubscriptionPage() {
  const router = useRouter();

  const subscription = {
    plan: "Professional",
    status: "active",
    billingCycle: "monthly",
    currentPeriodStart: "2024-11-01",
    currentPeriodEnd: "2024-12-01",
    price: 2999,
    nextBillingDate: "2024-12-01",
    paymentMethod: "UPI",
  };

  const usage = {
    orders: { current: 847, limit: 5000, percentage: 16.94, unit: "" },
    outlets: { current: 2, limit: 5, percentage: 40, unit: "" },
    staff: { current: 8, limit: 25, percentage: 32, unit: "" },
    items: { current: 156, limit: 1000, percentage: 15.6, unit: "" },
    storage: { current: 2.3, limit: 10, percentage: 23, unit: "GB" },
  };

  const features = [
    { name: "Multi-outlet management", enabled: true },
    { name: "Advanced analytics", enabled: true },
    { name: "AI menu scanning", enabled: true },
    { name: "AI image generation", enabled: true },
    { name: "Loyalty program", enabled: true },
    { name: "Marketing campaigns", enabled: true },
    { name: "Priority support", enabled: true },
    { name: "Custom branding", enabled: true },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trial":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const daysRemaining = Math.ceil(
    (new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

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
              <h1 className="text-xl font-bold text-gray-900">Subscription</h1>
              <p className="text-sm text-gray-600">
                Manage your plan and billing
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Plan */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-5 w-5" />
                  <h2 className="text-xl font-bold">{subscription.plan}</h2>
                </div>
                <Badge className={getStatusColor(subscription.status)}>
                  {subscription.status}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">₹{subscription.price}</div>
                <div className="text-sm opacity-90">per month</div>
              </div>
            </div>
            <div className="space-y-2 text-sm opacity-90">
              <div className="flex items-center justify-between">
                <span>Current Period</span>
                <span>
                  {formatDate(subscription.currentPeriodStart)} -{" "}
                  {formatDate(subscription.currentPeriodEnd)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Days Remaining</span>
                <span className="font-semibold">{daysRemaining} days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Billing */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">Next Billing Date</div>
                <div className="font-semibold text-gray-900">
                  {formatDate(subscription.nextBillingDate)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  ₹{subscription.price}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Meters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usage This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(usage).map(([key, data]) => (
                <div key={key}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium capitalize">{key}</span>
                    <span className="text-gray-600">
                      {data.current}
                      {data.unit || ""} / {data.limit}
                      {data.unit || ""}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        data.percentage > 80
                          ? "bg-red-500"
                          : data.percentage > 60
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${data.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Warning if usage is high */}
        {usage.orders.percentage > 80 && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-yellow-900 mb-1">
                    Approaching Order Limit
                  </div>
                  <p className="text-sm text-yellow-800">
                    You've used {usage.orders.percentage.toFixed(0)}% of your
                    monthly order limit. Consider upgrading to avoid service
                    interruption.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      feature.enabled ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    {feature.enabled ? (
                      <span className="text-green-600 text-xs">✓</span>
                    ) : (
                      <span className="text-gray-400 text-xs">✕</span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      feature.enabled ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/subscription/upgrade")}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/subscription/billing")}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Billing History
          </Button>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/subscription/usage")}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          View Detailed Usage
        </Button>
      </div>
    </div>
  );
}
