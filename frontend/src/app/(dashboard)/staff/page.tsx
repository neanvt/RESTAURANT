"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronRight, UserPlus, Activity, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { staffApi } from "@/lib/api/staff";
import { Staff, ROLE_LABELS, STATUS_LABELS } from "@/types/staff";
import { toast } from "sonner";

export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getAll();
      setStaff(data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to load staff"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStaff = async (staffMember: Staff) => {
    if (staffMember.role === "primary_admin") {
      toast.error("Cannot remove primary admin");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to remove ${staffMember.name} from this outlet?`
      )
    ) {
      return;
    }

    try {
      await staffApi.remove(staffMember._id);
      toast.success("Staff member removed successfully");
      loadStaff();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to remove staff"
      );
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "primary_admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "secondary_admin":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "staff":
        return "bg-green-100 text-green-700 border-green-200";
      case "waiter":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-1">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Manage Staff</h1>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading staff...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-1">
            <ChevronRight className="h-5 w-5 rotate-180" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Manage Staff</h1>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Check Staff Activity Button */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push("/staff/activity")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Check Staff Activity
                  </div>
                  <div className="text-xs text-gray-600">
                    View activity logs and history
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Staff List */}
        {staff.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No staff members yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Invite staff members to help manage your outlet
              </p>
            </CardContent>
          </Card>
        ) : (
          staff.map((member) => (
            <Card key={member._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {getInitials(member.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {member.name || "No Name"}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5">
                        {member.phone}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {ROLE_LABELS[member.role]}
                      </div>

                      {/* Status Badge */}
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {STATUS_LABELS[member.status]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {member.role !== "primary_admin" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveStaff(member)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      Remove User
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Invite Staff Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none">
        <Button
          onClick={() => router.push("/staff/invite")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white pointer-events-auto"
          size="lg"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Invite Staff
        </Button>
      </div>
    </div>
  );
}
