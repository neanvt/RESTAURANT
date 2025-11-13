"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Trash2, Phone, Mail, MapPin, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    loyaltyTier: "Bronze",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [customerStats, setCustomerStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    lastOrderDate: "",
  });

  useEffect(() => {
    // In a real app, fetch customer data
    // Mock data for demonstration
    setFormData({
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      email: "rahul@example.com",
      address: "123 MG Road, Bangalore, Karnataka - 560001",
      loyaltyTier: "Gold",
      notes: "Regular customer, prefers spicy food",
    });

    setCustomerStats({
      totalOrders: 47,
      totalSpent: 23450,
      loyaltyPoints: 2345,
      lastOrderDate: "2024-11-07",
    });
  }, [customerId]);

  const loyaltyTiers = ["Bronze", "Silver", "Gold", "Platinum"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, call API to update customer
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Customer updated successfully!");
      router.push("/customers");
    } catch (error) {
      alert("Failed to update customer");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this customer? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // In a real app, call API to delete customer
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Customer deleted successfully!");
      router.push("/customers");
    } catch (error) {
      alert("Failed to delete customer");
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze":
        return "bg-orange-100 text-orange-800";
      case "Silver":
        return "bg-gray-100 text-gray-800";
      case "Gold":
        return "bg-yellow-100 text-yellow-800";
      case "Platinum":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                  Edit Customer
                </h1>
                <p className="text-sm text-gray-600">Update customer details</p>
              </div>
            </div>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-2 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 className="h-5 w-5 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Customer Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {customerStats.totalOrders}
                </div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{customerStats.totalSpent.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {customerStats.loyaltyPoints}
                </div>
                <div className="text-sm text-gray-600">Loyalty Points</div>
              </div>
              <div>
                <Badge className={getTierColor(formData.loyaltyTier)}>
                  <Award className="h-3 w-3 mr-1" />
                  {formData.loyaltyTier}
                </Badge>
                <div className="text-sm text-gray-600 mt-1">Current Tier</div>
              </div>
            </div>
            {customerStats.lastOrderDate && (
              <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                Last order:{" "}
                {new Date(customerStats.lastOrderDate).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+91 12345 67890"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="customer@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Enter customer address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loyalty Tier
                </label>
                <select
                  value={formData.loyaltyTier}
                  onChange={(e) =>
                    setFormData({ ...formData, loyaltyTier: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {loyaltyTiers.map((tier) => (
                    <option key={tier} value={tier}>
                      {tier}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add notes about preferences, allergies, etc..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Updating..." : "Update Customer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* View Orders */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/customers/${customerId}`)}
        >
          View Order History
        </Button>
      </div>
    </div>
  );
}
