"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Printer,
  Eye,
  Filter,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderStore } from "@/store/orderStore";
import { Order } from "@/types/order";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import DateRangeFilter from "@/components/reports/DateRangeFilter";
import { getTodayLocal, getDaysAgoLocal } from "@/lib/date-utils";

export default function OrdersPage() {
  const router = useRouter();
  const {
    orders,
    filters,
    isLoading,
    fetchOrders,
    holdOrder,
    resumeOrder,
    cancelOrder,
    deleteOrder,
    generateKOT,
    setFilters,
  } = useOrderStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: getDaysAgoLocal(30),
    endDate: getTodayLocal(),
  });

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters({
      ...filters,
      // Only filter when search has 3+ characters
      search: value.length >= 3 ? value : undefined,
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({
      ...filters,
      status: status === "all" ? undefined : status,
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    });
  };

  const handleDateRangeChange = (newDateRange: {
    startDate: string;
    endDate: string;
  }) => {
    setDateRange(newDateRange);
    setFilters({
      ...filters,
      startDate: newDateRange.startDate || undefined,
      endDate: newDateRange.endDate || undefined,
    });
  };

  const calculateTotalAmount = () => {
    return orders.reduce((sum, order) => sum + order.total, 0).toFixed(2);
  };

  const handleHold = async (id: string) => {
    try {
      await holdOrder(id);
      toast.success("Order held successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to hold order");
    }
  };

  const handleResume = async (id: string) => {
    try {
      // Instead of just resuming, redirect to order creation page with the held order data
      router.push(`/orders/create?resumeOrderId=${id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to resume order");
    }
  };

  const handleCancel = async (order: Order) => {
    if (
      confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      )
    ) {
      try {
        const orderId = order.id || (order as any)._id;
        if (!orderId) {
          console.error("Order object:", order);
          throw new Error("Order ID is missing");
        }
        await deleteOrder(orderId);
        toast.success("Order cancelled successfully");
        // Refresh the orders list
        await fetchOrders();
      } catch (error: any) {
        console.error("Delete order error:", error);
        toast.error(error.message || "Failed to cancel order");
      }
    }
  };

  const handleGenerateKOT = async (id: string) => {
    try {
      await generateKOT(id);
      toast.success("KOT generated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate KOT");
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "kot_generated":
        return "bg-blue-100 text-blue-800";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "draft":
        return <Clock className="h-4 w-4" />;
      case "kot_generated":
        return <Printer className="h-4 w-4" />;
      case "on_hold":
        return <Pause className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: Order["status"]) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Orders</h1>
            </div>
            <Button
              onClick={() => router.push("/orders/create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1"
              />
              <Select
                value={filters.status || "all"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="kot_generated">KOT Generated</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <DateRangeFilter
              value={dateRange}
              onChange={handleDateRangeChange}
            />

            {/* Total Amount Display */}
            {orders.length > 0 && (
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-gray-700">
                  Total Orders: {orders.length}
                </span>
                <span className="text-lg font-bold text-blue-600">
                  ₹{calculateTotalAmount()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first order to get started
            </p>
            <Button
              onClick={() => router.push("/orders/create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, index) => (
              <div
                key={order.id || (order as any)._id}
                className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        #{order.orderNumber.split("-").pop()}
                      </h3>
                      <Badge
                        className={cn(
                          "flex items-center gap-1",
                          getStatusColor(order.status)
                        )}
                      >
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    {order.customer?.name && (
                      <p className="text-sm text-gray-600">
                        Customer: {order.customer.name}
                      </p>
                    )}
                    {order.tableNumber && (
                      <p className="text-sm text-gray-600">
                        Table: {order.tableNumber}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      ₹{order.total.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="mb-3">
                  <div className="text-sm text-gray-600">
                    {order.items.length} item(s):{" "}
                    {order.items
                      .map((item) => `${item.name} (${item.quantity})`)
                      .join(", ")}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/orders/${order.id || (order as any)._id}`)
                    }
                    className="h-7 px-2 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>

                  {order.status === "draft" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleGenerateKOT(order.id || (order as any)._id)
                        }
                        className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        <Printer className="h-3 w-3 mr-1" />
                        KOT
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleHold(order.id || (order as any)._id)
                        }
                        className="h-7 px-2 text-xs"
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Hold
                      </Button>
                    </>
                  )}

                  {order.status === "kot_generated" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleHold(order.id || (order as any)._id)
                        }
                        className="h-7 px-2 text-xs"
                        title="KOT Generated"
                      >
                        <Printer className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleHold(order.id || (order as any)._id)
                        }
                        className="h-7 px-2 text-xs"
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Hold
                      </Button>
                    </>
                  )}

                  {order.status === "on_hold" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleResume(order.id || (order as any)._id)
                      }
                      className="h-7 px-2 text-xs"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Resume
                    </Button>
                  )}

                  {(order.status === "draft" ||
                    order.status === "on_hold" ||
                    order.status === "kot_generated") &&
                    index === 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(order)}
                        className="h-7 px-2 text-xs text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
