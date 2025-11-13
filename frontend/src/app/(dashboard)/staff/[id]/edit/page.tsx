"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Trash2, Phone, Mail, Shield, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Waiter",
    status: "active",
    hourlyRate: "",
    hireDate: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [staffStats, setStaffStats] = useState({
    ordersHandled: 0,
    totalSales: 0,
    shiftsCompleted: 0,
    averageRating: 0,
  });

  useEffect(() => {
    // In a real app, fetch staff data
    // Mock data for demonstration
    setFormData({
      name: "Amit Kumar",
      email: "amit@restaurant.com",
      phone: "+91 98765 43210",
      role: "Waiter",
      status: "active",
      hourlyRate: "150",
      hireDate: "2024-01-15",
      address: "MG Road, Bangalore",
    });

    setStaffStats({
      ordersHandled: 234,
      totalSales: 145600,
      shiftsCompleted: 48,
      averageRating: 4.7,
    });
  }, [staffId]);

  const roles = [
    "Manager",
    "Kitchen",
    "Chef",
    "Waiter",
    "Cashier",
    "Kitchen Helper",
    "Delivery",
  ];
  const statuses = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    {
      value: "inactive",
      label: "Inactive",
      color: "bg-gray-100 text-gray-800",
    },
    {
      value: "on_leave",
      label: "On Leave",
      color: "bg-yellow-100 text-yellow-800",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In a real app, call API to update staff
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Staff member updated successfully!");
      router.push("/staff");
    } catch (error) {
      alert("Failed to update staff member");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to remove this staff member? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      // In a real app, call API to delete staff
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Staff member removed successfully!");
      router.push("/staff");
    } catch (error) {
      alert("Failed to remove staff member");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    const status = statuses.find((s) => s.value === formData.status);
    return status ? (
      <Badge className={status.color}>{status.label}</Badge>
    ) : null;
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
                <h1 className="text-xl font-bold text-gray-900">Edit Staff</h1>
                <p className="text-sm text-gray-600">
                  Update staff member details
                </p>
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
        {/* Staff Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Performance Overview</CardTitle>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {staffStats.ordersHandled}
                </div>
                <div className="text-sm text-gray-600">Orders Handled</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{staffStats.totalSales.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Sales</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {staffStats.shiftsCompleted}
                </div>
                <div className="text-sm text-gray-600">Shifts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {staffStats.averageRating.toFixed(1)}★
                </div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
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
                    placeholder="email@example.com"
                    required
                  />
                </div>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) =>
                      setFormData({ ...formData, hourlyRate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hire Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) =>
                        setFormData({ ...formData, hireDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Enter address"
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
                  {loading ? "Updating..." : "Update Staff"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(`/staff/activity?staffId=${staffId}`)}
          >
            View Activity
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => alert("Reset password email sent")}
          >
            Reset Password
          </Button>
        </div>
      </div>
    </div>
  );
}
