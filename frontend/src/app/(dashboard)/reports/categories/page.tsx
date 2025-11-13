"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Tag,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportStore } from "@/store/reportStore";
import DateRangeFilter from "@/components/reports/DateRangeFilter";
import { getTodayLocal, getDaysAgoLocal } from "@/lib/date-utils";

const categoryColors = [
  "bg-red-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-purple-500",
  "bg-indigo-500",
  "bg-orange-500",
];

export default function CategoryReportPage() {
  const router = useRouter();
  const { categorySales, isLoading, fetchCategorySalesReport } =
    useReportStore();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState({
    startDate: getDaysAgoLocal(30),
    endDate: getTodayLocal(),
  });

  useEffect(() => {
    // Initial fetch
    const loadData = async () => {
      await fetchCategorySalesReport(dateRange);
      setLastUpdated(new Date());
    };
    loadData();

    // Set up auto-refresh every 30 seconds for live data
    const intervalId = setInterval(async () => {
      await fetchCategorySalesReport(dateRange);
      setLastUpdated(new Date());
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [dateRange.startDate, dateRange.endDate, fetchCategorySalesReport]);

  const handleApplyDateRange = () => {
    fetchCategorySalesReport(dateRange);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category data...</p>
        </div>
      </div>
    );
  }

  const categoryData = categorySales.map((cat, index) => ({
    id: cat._id,
    name: cat.categoryName,
    revenue: cat.totalRevenue,
    orders: cat.quantitySold,
    uniqueItems: cat.uniqueItems,
    color: categoryColors[index % categoryColors.length],
  }));

  const totalRevenue = categoryData.reduce((sum, cat) => sum + cat.revenue, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Category Performance
                </h1>
                <p className="text-sm text-gray-600">Sales by category</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between pl-14">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live
            </div>
            <p className="text-xs text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
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

        {/* Total Revenue */}
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </CardContent>
        </Card>

        {/* Revenue Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData
                .sort((a, b) => b.revenue - a.revenue)
                .map((category) => {
                  const percentage = (category.revenue / totalRevenue) * 100;
                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${category.color}`}
                          ></div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="text-gray-600">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${category.color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Category Details */}
        {categoryData.length > 0 ? (
          <div className="space-y-3">
            {categoryData
              .sort((a, b) => b.revenue - a.revenue)
              .map((category) => (
                <Card key={category.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <Tag className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">
                          {category.name}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-gray-600">Revenue</div>
                            <div className="font-bold text-gray-900">
                              ₹{category.revenue.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Orders</div>
                            <div className="font-bold text-gray-900">
                              {category.orders}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          {category.uniqueItems} unique items
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No Data Available
              </h3>
              <p className="text-sm text-gray-600">
                No sales data found for the selected period
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
