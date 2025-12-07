"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { staffApi } from "@/lib/api/staff";
import { StaffRole, ROLE_LABELS } from "@/types/staff";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export default function InviteStaffPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  
  // Check if user has permission to invite staff
  useEffect(() => {
    if (user && user.role !== "primary_admin" && user.role !== "secondary_admin") {
      toast.error("You don't have permission to access this page");
      router.push("/dashboard");
    }
  }, [user, router]);
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    role: "staff" as StaffRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number
    if (!formData.phone || formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter staff member's name");
      return;
    }

    try {
      setLoading(true);
      await staffApi.invite(formData);
      toast.success("Staff member invited successfully");
      router.push("/staff");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to invite staff member"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, phone: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-1">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            Add Regular Customer
          </h1>
        </div>
      </div>

      <div className="p-4">
        {/* Info Card */}
        <Card className="mb-4 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-900 font-medium">
                  Fetch Customer Details Directly From Your Contacts.
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Invite staff members to help manage your outlet operations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Number */}
          <div>
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1.5 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500 text-sm font-medium">+91</span>
              </div>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit number"
                className="pl-12 h-12 text-base"
                maxLength={10}
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Staff member will receive login credentials via SMS
            </p>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Tap to Enter"
              className="mt-1.5 h-12 text-base"
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value as StaffRole })
              }
            >
              <SelectTrigger className="mt-1.5 h-12 text-base">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="secondary_admin">
                  {ROLE_LABELS.secondary_admin}
                </SelectItem>
                <SelectItem value="kitchen">{ROLE_LABELS.kitchen}</SelectItem>
                <SelectItem value="staff">{ROLE_LABELS.staff}</SelectItem>
                <SelectItem value="waiter">{ROLE_LABELS.waiter}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.role === "secondary_admin" &&
                "Can manage all operations except deleting the outlet"}
              {formData.role === "staff" &&
                "Can manage orders, items, and customers"}
              {formData.role === "waiter" &&
                "Can only create and manage orders"}
              {formData.role === "kitchen" &&
                "Can view and manage kitchen order tickets (KOTs) only"}
            </p>
          </div>

          {/* Role Permissions Info */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-700 mb-2">
                {ROLE_LABELS[formData.role]} Permissions:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                {formData.role === "secondary_admin" && (
                  <>
                    <li>• Manage items and categories</li>
                    <li>• Create and manage orders</li>
                    <li>• Manage customers</li>
                    <li>• View and generate reports</li>
                    <li>• Manage staff members</li>
                    <li>• Manage expenses and inventory</li>
                  </>
                )}
                {formData.role === "staff" && (
                  <>
                    <li>• Manage items and categories</li>
                    <li>• Create and manage orders</li>
                    <li>• Manage customers</li>
                  </>
                )}
                {formData.role === "waiter" && (
                  <>
                    <li>• Create and view orders</li>
                    <li>• Generate KOTs</li>
                  </>
                )}
                {formData.role === "kitchen" && (
                  <>
                    <li>• View active KOTs</li>
                    <li>• Update KOT item status</li>
                    <li>• Mark KOTs as completed</li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Inviting...
                </div>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Invite Staff Member
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
