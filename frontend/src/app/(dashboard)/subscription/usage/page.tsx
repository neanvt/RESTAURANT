"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionUsagePage() {
  const router = useRouter();

  const currentUsage = {
    orders: { current: 847, limit: 5000, previousMonth: 723, unit: "" },
    outlets: { current: 2, limit: 5, previousMonth: 2, unit: "" },
    staff: { current: 8, limit: 25, previousMonth: 7, unit: "" },
    items: { current: 156, limit: 1000, previousMonth: 142, unit: "" },
    storage: { current: 2.3, limit: 10, previousMonth: 2.1, unit: "GB" },
  };

  const dailyOrders = [
    { date: "Nov 1", orders: 28 },
    { date: "Nov 2", orders: 32 },
    { date: "Nov 3", orders: 25 },
    { date: "Nov 4", orders: 38 },
    { date: "Nov 5", orders: 42 },
    { date: "Nov 6", orders: 35 },
    { date: "Nov 7", orders: 31 },
  ];

  const maxOrders = Math.max(...dailyOrders.map((d) => d.orders));

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0,
    };
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
              <h1 className="text-xl font-bold text-gray-900">
                Usage Analytics
              </h1>
              <p className="text-sm text-gray-600">Detailed usage breakdown</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Period */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Current Billing Period
              </CardTitle>
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              Nov 1, 2024 - Nov 30, 2024
            </div>
            <div className="text-xs text-gray-500 mt-1">23 days remaining</div>
          </CardContent>
        </Card>

        {/* Usage Metrics */}
        {Object.entries(currentUsage).map(([key, data]) => {
          const change = calculateChange(data.current, data.previousMonth);
          const percentage = (data.current / data.limit) * 100;

          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-base capitalize">{key}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Current vs Limit */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-2xl font-bold">
                        {data.current}
                        {data.unit || ""}
                      </span>
                      <span className="text-gray-600">
                        of {data.limit}
                        {data.unit || ""}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage > 80
                            ? "bg-red-500"
                            : percentage > 60
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Comparison */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-gray-600">vs last month</span>
                    <div className="flex items-center gap-1">
                      {change.isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-semibold ${
                          change.isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {change.value}%
                      </span>
                    </div>
                  </div>

                  {/* Previous Month */}
                  <div className="text-xs text-gray-500">
                    Previous month: {data.previousMonth}
                    {data.unit || ""}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Daily Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Daily Orders (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyOrders.map((day) => (
                <div key={day.date} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{day.date}</span>
                    <span className="font-semibold">{day.orders}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${(day.orders / maxOrders) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">7-day average</span>
                <span className="font-bold text-gray-900">
                  {Math.round(
                    dailyOrders.reduce((sum, d) => sum + d.orders, 0) /
                      dailyOrders.length
                  )}{" "}
                  orders/day
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900 mb-2">Usage Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  You're using {currentUsage.orders.current} of{" "}
                  {currentUsage.orders.limit} orders. Plenty of capacity
                  remaining!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  Consider archiving unused items to optimize storage usage.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  Your usage is{" "}
                  {
                    calculateChange(
                      currentUsage.orders.current,
                      currentUsage.orders.previousMonth
                    ).value
                  }
                  % higher than last month.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/subscription/upgrade")}
        >
          Upgrade Plan
        </Button>
      </div>
    </div>
  );
}
