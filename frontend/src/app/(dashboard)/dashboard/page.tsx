"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Printer,
  CheckCircle,
  Clock,
  UtensilsCrossed,
  Store,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useReportStore } from "@/store/reportStore";
import { useOutletStore } from "@/store/outletStore";
import { cn } from "@/lib/utils";
import Image from "next/image";
import OutletSelectorModal from "@/components/outlets/OutletSelectorModal";

export default function DashboardPage() {
  const router = useRouter();
  const { dashboardStats, fetchDashboardStats, isLoading } = useReportStore();
  const { currentOutlet } = useOutletStore();
  const [printerStatus, setPrinterStatus] = useState<"online" | "offline">(
    "offline"
  );
  const [showOutletModal, setShowOutletModal] = useState(false);

  useEffect(() => {
    // Only fetch stats if outlet is selected
    if (currentOutlet) {
      fetchDashboardStats();
    }
  }, [currentOutlet, fetchDashboardStats]);

  // Add visibility change handler to refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && currentOutlet) {
        fetchDashboardStats();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [currentOutlet, fetchDashboardStats]);

  useEffect(() => {
    // Poll for updates every 30 seconds only if outlet is selected
    if (!currentOutlet) return;

    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [currentOutlet, fetchDashboardStats]);

  const formatCurrency = (amount: number) => {
    return `₹ ${amount.toFixed(2)}`;
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  const handleRefresh = async () => {
    await fetchDashboardStats();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          {/* Outlet Selector */}
          <button
            onClick={() => setShowOutletModal(true)}
            className="flex items-center gap-2 text-gray-900 font-semibold text-lg hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
          >
            <span>{currentOutlet?.businessName || "Select Outlet"}</span>
            <ChevronDown className="h-5 w-5 text-gray-600" />
          </button>

          {/* Logo */}
          {currentOutlet?.logo ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${currentOutlet.logo}`}
                alt={currentOutlet.businessName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {currentOutlet?.businessName?.[0] || "R"}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Printer Status */}
        <Card className="border-gray-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Printer className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700">
                  Your printer is {printerStatus}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    printerStatus === "online"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {printerStatus === "online" ? "Online" : "Offline"}
                </span>
                <button
                  onClick={() =>
                    setPrinterStatus(
                      printerStatus === "online" ? "offline" : "online"
                    )
                  }
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Toggle printer status"
                >
                  <RefreshCw className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {/* Closed Orders */}
            <button
              onClick={() => router.push("/orders?status=completed")}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center font-medium">
                Closed Orders
              </span>
            </button>

            {/* On Hold Orders */}
            <button
              onClick={() => router.push("/orders?status=on_hold")}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center font-medium">
                On Hold Orders
              </span>
            </button>

            {/* Add Items */}
            <button
              onClick={() => router.push("/items/create")}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <UtensilsCrossed className="h-7 w-7 text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center font-medium">
                Add Items
              </span>
            </button>
          </div>
        </div>

        {/* Business Overview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">
              Business Overview
            </h2>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Refresh statistics"
            >
              <RefreshCw
                className={cn(
                  "h-4 w-4 text-gray-600",
                  isLoading && "animate-spin"
                )}
              />
            </button>
          </div>
          <Card className="border-gray-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Store Icon */}
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Store className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>

                  {/* Today's Stats */}
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    {/* Sales */}
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Today's sales
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {dashboardStats
                          ? formatCurrency(dashboardStats.today.revenue)
                          : formatCurrency(0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {dashboardStats
                          ? formatCurrency(dashboardStats.yesterday.revenue)
                          : formatCurrency(0)}{" "}
                        (Yesterday's)
                      </div>
                    </div>

                    {/* Orders */}
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        Today's orders
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {dashboardStats?.today.orders || 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {dashboardStats?.yesterday.orders || 0} (Yesterday's)
                      </div>
                    </div>
                  </div>

                  {/* Insights Link */}
                  <button
                    onClick={() => router.push("/reports")}
                    className="flex items-center justify-between w-full p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-sm text-gray-700 font-medium">
                      Top selling items & more insights!
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Cards */}
        {dashboardStats && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="text-xs text-gray-600 mb-1">Paid Invoices</div>
                <div className="text-xl font-bold text-gray-900">
                  {dashboardStats.today.invoices}
                </div>
                <div className="text-xs text-gray-500 mt-1">Today</div>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-4">
                <div className="text-xs text-gray-600 mb-1">Month to Date</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(dashboardStats.monthToDate.revenue)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Revenue</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* More Quick Actions */}
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              More Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/orders/create")}
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <UtensilsCrossed className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm">Create New Order</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/kots")}
              >
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">View Kitchen Orders</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/customers")}
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <Store className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm">Manage Customers</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outlet Selector Modal */}
      <OutletSelectorModal
        isOpen={showOutletModal}
        onClose={() => setShowOutletModal(false)}
        showLogout={true}
      />
    </div>
  );
}
