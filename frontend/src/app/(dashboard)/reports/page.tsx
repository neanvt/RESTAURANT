"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  IndianRupee,
  Receipt,
  Calendar,
  ArrowRight,
  FileText,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportStore } from "@/store/reportStore";
import { useAuthStore } from "@/store/authStore";
import { useOutletStore } from "@/store/outletStore";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const router = useRouter();
  const { dashboardStats, isLoading, fetchDashboardStats } = useReportStore();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentOutlet = useOutletStore((s) => s.currentOutlet);

  useEffect(() => {
    // Only fetch when authenticated and an outlet is selected
    if (!isAuthenticated || !currentOutlet) return;

    // Initial fetch
    const loadData = async () => {
      await fetchDashboardStats();
      setLastUpdated(new Date());
    };
    loadData();

    // Set up auto-refresh every 30 seconds for live data
    const intervalId = setInterval(async () => {
      await fetchDashboardStats();
      setLastUpdated(new Date());
    }, 30000); // 30 seconds

    // Cleanup interval on unmount or when deps change
    return () => clearInterval(intervalId);
  }, [fetchDashboardStats, isAuthenticated, currentOutlet]);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return null; // Return null when no previous data
    return ((current - previous) / previous) * 100;
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  if (isLoading || !dashboardStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const ordersChange = calculateChange(
    dashboardStats.today.orders,
    dashboardStats.yesterday.orders
  );
  const revenueChange = calculateChange(
    dashboardStats.today.revenue,
    dashboardStats.yesterday.revenue
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Reports & Analytics
                </h1>
                <p className="text-sm text-gray-600">
                  Business insights and statistics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Today's Overview */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Today's Performance
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Orders Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  {ordersChange !== null && (
                    <div
                      className={cn(
                        "flex items-center text-xs font-medium",
                        ordersChange >= 0 ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {ordersChange >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(ordersChange).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {dashboardStats.today.orders}
                </div>
                <div className="text-xs text-gray-600">Total Orders</div>
                <div className="text-xs text-gray-500 mt-1">
                  Yesterday: {dashboardStats.yesterday.orders}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <IndianRupee className="h-5 w-5 text-green-600" />
                  </div>
                  {revenueChange !== null && (
                    <div
                      className={cn(
                        "flex items-center text-xs font-medium",
                        revenueChange >= 0 ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {revenueChange >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(revenueChange).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardStats.today.revenue)}
                </div>
                <div className="text-xs text-gray-600">Revenue</div>
                <div className="text-xs text-gray-500 mt-1">
                  Yesterday: {formatCurrency(dashboardStats.yesterday.revenue)}
                </div>
              </CardContent>
            </Card>

            {/* Month to Date Card */}
            <Card className="col-span-2">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Receipt className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(dashboardStats.monthToDate.revenue)}
                    </div>
                    <div className="text-xs text-gray-600">
                      Month to Date Revenue
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Detailed Reports
          </h2>
          <div className="space-y-2">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push("/reports/sales")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IndianRupee className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Sales Report
                    </div>
                    <div className="text-xs text-gray-600">
                      Daily, weekly, and monthly sales analysis
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-green-200 bg-green-50"
              onClick={() => router.push("/reports/items")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Item Sales Report
                    </div>
                    <div className="text-xs text-gray-600">
                      Items sorted by revenue - Top selling items
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-green-600" />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push("/orders")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Order Report
                    </div>
                    <div className="text-xs text-gray-600">
                      View all orders with filters and details
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push("/reports/categories")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Category Report
                    </div>
                    <div className="text-xs text-gray-600">
                      Sales breakdown by category
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push("/reports/payments")}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Receipt className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Payment Methods
                    </div>
                    <div className="text-xs text-gray-600">
                      Analysis of payment preferences
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
