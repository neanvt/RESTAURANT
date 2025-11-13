"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Activity, Clock, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { staffApi } from "@/lib/api/staff";
import { StaffActivity } from "@/types/staff";
import { toast } from "sonner";
import { format } from "date-fns";

export default function StaffActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<StaffActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getActivity({ limit: 50 });
      setActivities(data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || "Failed to load activity"
      );
    } finally {
      setLoading(false);
    }
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case "order_created":
      case "kot_generated":
        return "bg-green-100 text-green-700";
      case "item_created":
      case "item_updated":
        return "bg-blue-100 text-blue-700";
      case "invoice_generated":
        return "bg-purple-100 text-purple-700";
      case "customer_added":
        return "bg-pink-100 text-pink-700";
      case "expense_added":
        return "bg-red-100 text-red-700";
      case "login":
      case "logout":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-1">
              <ChevronRight className="h-5 w-5 rotate-180" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Staff Activity</h1>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading activity...</p>
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
          <h1 className="text-xl font-bold text-gray-900">Staff Activity</h1>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Track all staff actions and operations
        </p>
      </div>

      <div className="p-4 space-y-3">
        {activities.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No activity yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Staff actions will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          activities.map((activity) => (
            <Card key={activity._id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {activity.user.name
                        ? activity.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)
                        : "?"}
                    </div>
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {activity.user.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {activity.action}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getActionTypeColor(
                          activity.actionType
                        )}`}
                      >
                        {formatActionType(activity.actionType)}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(
                          new Date(activity.timestamp),
                          "MMM dd, yyyy 'at' hh:mm a"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
