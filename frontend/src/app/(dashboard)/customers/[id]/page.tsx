"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomerStore } from "@/store/customerStore";
import { toast } from "sonner";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const { currentCustomer, getCustomerById, isLoading } = useCustomerStore();

  useEffect(() => {
    getCustomerById(customerId).catch(() => {
      toast.error("Customer not found");
      router.push("/customers");
    });
  }, [customerId, getCustomerById, router]);

  if (isLoading || !currentCustomer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer...</p>
        </div>
      </div>
    );
  }

  const customer = currentCustomer;
  const stats = currentCustomer.statistics;
  const recentOrders = currentCustomer.recentOrders;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {customer.name}
                </h1>
                <p className="text-sm text-gray-600">{customer.phone}</p>
              </div>
            </div>
            <Button
              onClick={() => router.push(`/customers/${customerId}/edit`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{customer.address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">
                    Total Orders
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {stats.totalOrders}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    Total Spent
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  ₹{stats.totalSpent.toFixed(2)}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-purple-600 font-medium">
                    Average Order Value
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  ₹{stats.averageOrderValue.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Dates */}
        {(customer.dateOfBirth || customer.anniversary) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Special Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {customer.dateOfBirth && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Birthday:</span>
                  <span className="text-gray-900">
                    {new Date(customer.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              )}
              {customer.anniversary && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Anniversary:</span>
                  <span className="text-gray-900">
                    {new Date(customer.anniversary).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {customer.tags && customer.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {customer.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{customer.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No orders yet
              </p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    onClick={() => router.push(`/orders/${order._id}`)}
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">
                        ₹{order.total.toFixed(2)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Since */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Member since:</span>
              <span className="text-gray-900">
                {new Date(customer.createdAt).toLocaleDateString()}
              </span>
            </div>
            {customer.lastOrderDate && (
              <div className="flex items-center gap-2 text-sm">
                <ShoppingBag className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Last order:</span>
                <span className="text-gray-900">
                  {new Date(customer.lastOrderDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Status:</span>
              <Badge variant={customer.isActive ? "default" : "secondary"}>
                {customer.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
