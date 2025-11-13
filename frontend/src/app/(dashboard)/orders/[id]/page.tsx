"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Calendar,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderStore } from "@/store/orderStore";
import { Order } from "@/types/order";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    currentOrder,
    getOrderById,
    holdOrder,
    resumeOrder,
    cancelOrder,
    generateKOT,
  } = useOrderStore();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoading(true);
        const fetchedOrder = await getOrderById(id);
        setOrder(fetchedOrder);
      } catch (error: any) {
        toast.error(error.message || "Failed to load order");
        router.push("/orders");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadOrder();
    }
  }, [id, getOrderById, router]);

  const handleGenerateKOT = async () => {
    if (!order) return;
    try {
      await generateKOT(order.id);
      toast.success("KOT generated successfully");
      // Reload order
      const updated = await getOrderById(order.id);
      setOrder(updated);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate KOT");
    }
  };

  const handleHold = async () => {
    if (!order) return;
    try {
      await holdOrder(order.id);
      toast.success("Order held successfully");
      const updated = await getOrderById(order.id);
      setOrder(updated);
    } catch (error: any) {
      toast.error(error.message || "Failed to hold order");
    }
  };

  const handleResume = async () => {
    if (!order) return;
    try {
      await resumeOrder(order.id);
      toast.success("Order resumed successfully");
      const updated = await getOrderById(order.id);
      setOrder(updated);
    } catch (error: any) {
      toast.error(error.message || "Failed to resume order");
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    if (confirm("Are you sure you want to cancel this order?")) {
      try {
        await cancelOrder(order.id);
        toast.success("Order cancelled successfully");
        const updated = await getOrderById(order.id);
        setOrder(updated);
      } catch (error: any) {
        toast.error(error.message || "Failed to cancel order");
      }
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

  const getStatusLabel = (status: Order["status"]) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Button onClick={() => router.push("/orders")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {order.orderNumber}
              </h1>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            {order.status === "draft" && (
              <>
                <Button
                  size="sm"
                  onClick={handleGenerateKOT}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="h-3 w-3 mr-1" />
                  Generate KOT
                </Button>
                <Button size="sm" variant="outline" onClick={handleHold}>
                  <Pause className="h-3 w-3 mr-1" />
                  Hold
                </Button>
              </>
            )}
            {order.status === "kot_generated" && (
              <>
                <Button
                  size="sm"
                  onClick={() => router.push(`/invoices/create/${order.id}`)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Receipt className="h-3 w-3 mr-1" />
                  Create Invoice
                </Button>
                <Button size="sm" variant="outline" onClick={handleHold}>
                  <Pause className="h-3 w-3 mr-1" />
                  Hold
                </Button>
              </>
            )}
            {order.status === "on_hold" && (
              <Button size="sm" variant="outline" onClick={handleResume}>
                <Play className="h-3 w-3 mr-1" />
                Resume
              </Button>
            )}
            {order.status === "completed" && (
              <Button
                size="sm"
                onClick={() => router.push(`/invoices/create/${order.id}`)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Receipt className="h-3 w-3 mr-1" />
                Create Invoice
              </Button>
            )}
            {(order.status === "draft" || order.status === "on_hold") && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Customer & Table Info */}
        {(order.customer || order.tableNumber) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.customer?.name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{order.customer.name}</span>
                </div>
              )}
              {order.customer?.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{order.customer.phone}</span>
                </div>
              )}
              {order.customer?.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    {order.customer.address}
                  </span>
                </div>
              )}
              {order.tableNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-600">Table:</span>
                  <span className="text-gray-900">{order.tableNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    {item.notes && (
                      <div className="text-sm text-gray-500 mt-1">
                        Note: {item.notes}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>Qty: {item.quantity}</span>
                      <span>₹{item.price.toFixed(2)} each</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      ₹{item.total.toFixed(2)}
                    </div>
                    {item.tax && (
                      <div className="text-xs text-gray-500">
                        +₹{item.tax.amount.toFixed(2)} tax
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">
                  ₹{order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">
                  ₹{order.taxAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-blue-600">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Notes */}
        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Created:</span>
              <span className="text-gray-900">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            {order.completedAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">Completed:</span>
                <span className="text-gray-900">
                  {new Date(order.completedAt).toLocaleString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge
                className={
                  order.paymentStatus === "paid"
                    ? "bg-green-100 text-green-800"
                    : order.paymentStatus === "partial"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {order.paymentStatus.toUpperCase()}
              </Badge>
            </div>
            {order.paymentMethod && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-600">Method:</span>
                <span className="text-gray-900 capitalize">
                  {order.paymentMethod}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
