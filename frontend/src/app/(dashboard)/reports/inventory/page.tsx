"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  CheckCircle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function InventoryReportPage() {
  const router = useRouter();

  const inventoryData = [
    {
      item: "Tomatoes",
      current: 5,
      required: 50,
      unit: "kg",
      status: "critical",
    },
    { item: "Onions", current: 15, required: 40, unit: "kg", status: "low" },
    { item: "Rice", current: 45, required: 50, unit: "kg", status: "good" },
    { item: "Cooking Oil", current: 8, required: 20, unit: "L", status: "low" },
    {
      item: "Spices Mix",
      current: 25,
      required: 30,
      unit: "kg",
      status: "good",
    },
    { item: "Flour", current: 35, required: 40, unit: "kg", status: "good" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "low":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "good":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "low":
        return <AlertTriangle className="h-4 w-4" />;
      case "good":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const criticalItems = inventoryData.filter((i) => i.status === "critical");
  const lowItems = inventoryData.filter((i) => i.status === "low");

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
                  Inventory Report
                </h1>
                <p className="text-sm text-gray-600">Stock levels & alerts</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Alert Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-red-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-red-600">
                {criticalItems.length}
              </div>
              <div className="text-xs text-gray-600">Critical</div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {lowItems.length}
              </div>
              <div className="text-xs text-gray-600">Low Stock</div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {inventoryData.length - criticalItems.length - lowItems.length}
              </div>
              <div className="text-xs text-gray-600">Good</div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Alerts */}
        {criticalItems.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-base text-red-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Critical Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {criticalItems.map((item) => (
                  <div key={item.item} className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {item.item}
                      </span>
                      <span className="text-red-600 font-bold">
                        {item.current}
                        {item.unit}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Required: {item.required}
                      {item.unit}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Inventory Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventoryData.map((item) => {
                const percentage = (item.current / item.required) * 100;

                return (
                  <div key={item.item} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {item.item}
                        </span>
                      </div>
                      <Badge
                        className={cn(
                          "text-xs flex items-center gap-1",
                          getStatusColor(item.status)
                        )}
                      >
                        {getStatusIcon(item.status)}
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full",
                            item.status === "critical"
                              ? "bg-red-500"
                              : item.status === "low"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          )}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 min-w-[80px] text-right">
                        {item.current}/{item.required}
                        {item.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <Button
              className="w-full"
              onClick={() => router.push("/inventory")}
            >
              <Package className="h-4 w-4 mr-2" />
              Manage Inventory
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
