"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingCart,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useReportStore } from "@/store/reportStore";
import DateRangeFilter from "@/components/reports/DateRangeFilter";
import { getTodayLocal, getDaysAgoLocal } from "@/lib/date-utils";

export default function SalesReportPage() {
  const router = useRouter();
  const { salesReport, fetchSalesReport, isLoading } = useReportStore();
  const [dateRange, setDateRange] = useState({
    startDate: getDaysAgoLocal(7),
    endDate: getTodayLocal(),
  });

  const [activeTab, setActiveTab] = useState("daily");

  useEffect(() => {
    // Always fetch daily data for all tabs
    fetchSalesReport({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      groupBy: "day",
    });
  }, [dateRange.startDate, dateRange.endDate]);

  const handleApplyDateRange = () => {
    fetchSalesReport({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
  };

  // Process sales data for display
  const dailyData =
    salesReport?.salesData.map((item: any) => {
      const date = new Date(item._id.year, item._id.month - 1, item._id.day);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return {
        date: dayNames[date.getDay()],
        fullDate: date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        revenue: item.totalRevenue,
        orders: item.totalOrders,
      };
    }) || [];

  // Weekly uses same daily data
  const weeklyData = dailyData;

  // Monthly view: Show ALL dates of the current month (1-30/31)
  const monthlyData = (() => {
    // Create a map of existing data by date number
    const dataMap = new Map<number, any>();
    dailyData.forEach((item) => {
      // Parse date from "9 Nov, 2024" format
      const dateParts = item.fullDate.split(" ");
      const dayNum = parseInt(dateParts[0]);
      dataMap.set(dayNum, item);
    });

    // Get current month and year from the date range
    const refDate = new Date(dateRange.endDate); // Use end date as reference
    const year = refDate.getFullYear();
    const month = refDate.getMonth();

    // Get number of days in this month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const fullData = [];

    // Generate all dates from 1 to last day of month
    for (let day = 1; day <= daysInMonth; day++) {
      const existing = dataMap.get(day);

      if (existing) {
        fullData.push(existing);
      } else {
        // Add missing date with 0 values
        const d = new Date(year, month, day);
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        fullData.push({
          date: dayNames[d.getDay()],
          fullDate: d.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          revenue: 0,
          orders: 0,
        });
      }
    }

    return fullData;
  })();

  const stats = {
    totalRevenue: salesReport?.summary.totalRevenue || 0,
    totalOrders: salesReport?.summary.totalOrders || 0,
    averageOrderValue: salesReport?.summary.averageOrderValue || 0,
    growthRate: 0, // Can be calculated if we have historical data
  };

  const getMaxRevenue = (data: any[]) =>
    data.length > 0 ? Math.max(...data.map((d: any) => d.revenue)) : 1;

  const maxDailyRevenue = getMaxRevenue(dailyData);
  const maxWeeklyRevenue = getMaxRevenue(weeklyData);
  const maxMonthlyRevenue = getMaxRevenue(monthlyData);

  const handleExport = () => {
    // Simulate export
    alert("Exporting report to PDF...");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Sales Report
                </h1>
                <p className="text-sm text-gray-600">
                  Analyze your sales performance
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Date Range Filter */}
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          onApply={handleApplyDateRange}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                </div>
                {stats.growthRate > 0 && (
                  <div className="flex items-center text-xs font-medium text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stats.growthRate}%
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ₹{Math.round(stats.totalRevenue).toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-gray-600">Total Revenue</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalOrders}
              </div>
              <div className="text-xs text-gray-600">Total Orders</div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  ₹{Math.round(stats.averageOrderValue).toLocaleString("en-IN")}
                </div>
                <div className="text-sm text-gray-600">Average Order Value</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="daily"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            {/* Data List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Data</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : dailyData.length > 0 ? (
                  <div className="space-y-2">
                    {dailyData.map((day: any, index: number) => (
                      <div
                        key={`daily-${day.fullDate}-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {day.date}
                          </div>
                          <div className="text-xs text-gray-500">
                            {day.fullDate}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            ₹{Math.round(day.revenue).toLocaleString("en-IN")}
                          </div>
                          <div className="text-xs text-gray-600">
                            {day.orders} orders
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No data available for this date range
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weekly Data</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : weeklyData.length > 0 ? (
                  <div className="space-y-2">
                    {weeklyData.map((day: any, index: number) => (
                      <div
                        key={`weekly-${day.fullDate}-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {day.date}
                          </div>
                          <div className="text-xs text-gray-500">
                            {day.fullDate}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            ₹{Math.round(day.revenue).toLocaleString("en-IN")}
                          </div>
                          <div className="text-xs text-gray-600">
                            {day.orders} orders
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No data available for this date range
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Data</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : monthlyData.length > 0 ? (
                  <div className="space-y-2">
                    {monthlyData.map((day: any, index: number) => (
                      <div
                        key={`monthly-${day.fullDate}-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {day.date}
                          </div>
                          <div className="text-xs text-gray-500">
                            {day.fullDate}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            ₹{Math.round(day.revenue).toLocaleString("en-IN")}
                          </div>
                          <div className="text-xs text-gray-600">
                            {day.orders} orders
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No data available for this date range
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Top Performing Days */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performing Days</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : dailyData.length > 0 ? (
              <div className="space-y-3">
                {[...dailyData]
                  .sort((a: any, b: any) => b.revenue - a.revenue)
                  .slice(0, 3)
                  .map((day: any, index: number) => (
                    <div
                      key={`top-${day.fullDate}-${index}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {day.date}
                        </div>
                        <div className="text-xs text-gray-500">
                          {day.fullDate}
                        </div>
                        <div className="text-xs text-gray-600">
                          {day.orders} orders
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          ₹{Math.round(day.revenue).toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
