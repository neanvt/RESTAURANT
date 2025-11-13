"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  Package,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportStore } from "@/store/reportStore";
import { toast } from "sonner";
import DateRangeFilter from "@/components/reports/DateRangeFilter";
import { getTodayLocal, getDaysAgoLocal } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

type SortBy = "revenue" | "quantity";

export default function ItemSalesReportPage() {
  const router = useRouter();
  const { itemSales, isLoading, fetchItemSalesReport } = useReportStore();

  const [dateRange, setDateRange] = useState({
    startDate: getDaysAgoLocal(30),
    endDate: getTodayLocal(),
  });

  const [sortBy, setSortBy] = useState<SortBy>("revenue");

  useEffect(() => {
    handleFetchReport();
  }, [dateRange.startDate, dateRange.endDate]);

  const handleFetchReport = async () => {
    try {
      await fetchItemSalesReport(dateRange);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch report");
    }
  };

  const handleApplyDateRange = () => {
    handleFetchReport();
  };

  const handleExport = () => {
    // Create CSV content
    const headers = [
      "Item Name",
      "Category",
      "Quantity Sold",
      "Revenue",
      "Avg Price",
    ];
    const rows = itemSales.map((item) => [
      item.itemName,
      item.categoryName,
      item.quantitySold,
      item.totalRevenue.toFixed(2),
      item.averagePrice.toFixed(2),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `item-sales-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Report exported successfully");
  };

  // Sort items based on selected criteria
  const sortedItems = useMemo(() => {
    const sorted = [...itemSales];
    if (sortBy === "revenue") {
      sorted.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } else {
      sorted.sort((a, b) => b.quantitySold - a.quantitySold);
    }
    return sorted;
  }, [itemSales, sortBy]);

  const totalQuantity = itemSales.reduce(
    (sum, item) => sum + item.quantitySold,
    0
  );
  const totalRevenue = itemSales.reduce(
    (sum, item) => sum + item.totalRevenue,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                Item Sales Report
              </h1>
              <p className="text-sm text-gray-600">
                Sort by revenue or quantity sold
              </p>
            </div>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              disabled={itemSales.length === 0}
              className="ml-auto"
            >
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

        {/* Sort Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <ArrowUpDown className="h-4 w-4" />
            <span>Sort by:</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant={sortBy === "revenue" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("revenue")}
              className={cn(
                "text-xs",
                sortBy === "revenue" && "bg-blue-600 hover:bg-blue-700"
              )}
            >
              Revenue
            </Button>
            <Button
              variant={sortBy === "quantity" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("quantity")}
              className={cn(
                "text-xs",
                sortBy === "quantity" && "bg-blue-600 hover:bg-blue-700"
              )}
            >
              Quantity Sold
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading report...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {totalQuantity}
                  </div>
                  <div className="text-xs text-gray-600">Total Items Sold</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{totalRevenue.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-600">Total Revenue</div>
                </CardContent>
              </Card>
            </div>

            {/* Items List */}
            {itemSales.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-gray-600">
                    No data available for selected period
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {sortedItems.map((item, index) => (
                  <Card key={item._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">
                              #{index + 1}
                            </span>
                            <h3 className="font-semibold text-gray-900">
                              {item.itemName}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-600">
                            {item.categoryName}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            ₹{item.totalRevenue.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t">
                        <div>
                          <div className="text-xs text-gray-600">
                            Quantity Sold
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {item.quantitySold} units
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600">Avg Price</div>
                          <div className="text-sm font-semibold text-gray-900">
                            ₹{item.averagePrice.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Progress bar for revenue percentage */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Revenue Share</span>
                          <span>
                            {((item.totalRevenue / totalRevenue) * 100).toFixed(
                              1
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                (item.totalRevenue / totalRevenue) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
