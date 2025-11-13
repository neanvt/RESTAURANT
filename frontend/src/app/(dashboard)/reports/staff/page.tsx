"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Award, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StaffReportPage() {
  const router = useRouter();

  const staffData = [
    {
      name: "Rajesh Kumar",
      role: "Waiter",
      orders: 156,
      revenue: 78000,
      rating: 4.8,
      performance: "excellent",
    },
    {
      name: "Priya Sharma",
      role: "Chef",
      orders: 142,
      revenue: 65000,
      rating: 4.7,
      performance: "excellent",
    },
    {
      name: "Amit Patel",
      role: "Cashier",
      orders: 98,
      revenue: 45000,
      rating: 4.5,
      performance: "good",
    },
    {
      name: "Sneha Reddy",
      role: "Waiter",
      orders: 87,
      revenue: 38000,
      rating: 4.3,
      performance: "good",
    },
  ];

  const totalOrders = staffData.reduce((sum, s) => sum + s.orders, 0);
  const totalRevenue = staffData.reduce((sum, s) => sum + s.revenue, 0);

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "excellent":
        return "bg-green-100 text-green-700";
      case "good":
        return "bg-blue-100 text-blue-700";
      case "average":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
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
                  Staff Performance
                </h1>
                <p className="text-sm text-gray-600">
                  Team metrics & analytics
                </p>
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
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {staffData.length}
              </div>
              <div className="text-xs text-gray-600">Active Staff</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {totalOrders}
              </div>
              <div className="text-xs text-gray-600">Total Orders</div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">
                ₹{totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Total Revenue Generated
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {staffData
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 3)
                .map((staff, index) => (
                  <div key={staff.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {staff.name}
                      </div>
                      <div className="text-xs text-gray-600">{staff.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ₹{staff.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">
                        {staff.orders} orders
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Staff Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Staff Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {staffData.map((staff) => (
                <Card key={staff.name} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {staff.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {staff.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {staff.role}
                            </div>
                          </div>
                          <Badge
                            className={getPerformanceColor(staff.performance)}
                          >
                            {staff.performance}
                          </Badge>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          <div>
                            <div className="text-xs text-gray-600">Orders</div>
                            <div className="font-bold text-gray-900">
                              {staff.orders}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Revenue</div>
                            <div className="font-bold text-gray-900">
                              ₹{(staff.revenue / 1000).toFixed(0)}k
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Rating</div>
                            <div className="font-bold text-gray-900 flex items-center gap-1">
                              ⭐ {staff.rating}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              💡 Team Insights
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Average team rating: 4.6/5.0</li>
              <li>Best performer: {staffData[0].name}</li>
              <li>
                Team handling {Math.round(totalOrders / staffData.length)}{" "}
                orders per person
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="p-4">
            <Button className="w-full" onClick={() => router.push("/staff")}>
              <Users className="h-4 w-4 mr-2" />
              Manage Staff
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
