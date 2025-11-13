"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, ChefHat, CheckCircle, Flame, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKOTStore } from "@/store/kotStore";
import { KOT, KOTItem } from "@/types/kot";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function KOTsPage() {
  const router = useRouter();
  const {
    kots,
    filters,
    isLoading,
    fetchKOTs,
    updateKOTItemStatus,
    updateKOTStatus,
    setFilters,
  } = useKOTStore();

  useEffect(() => {
    fetchKOTs();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchKOTs();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchKOTs]);

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status: status === "all" ? undefined : status });
  };

  const handleItemStatusChange = async (
    kotId: string,
    itemId: string,
    status: string
  ) => {
    try {
      await updateKOTItemStatus(kotId, itemId, status);
      toast.success("Item status updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update item status");
    }
  };

  const handleKOTComplete = async (kotId: string) => {
    try {
      await updateKOTStatus(kotId, "completed");
      toast.success("KOT marked as completed");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete KOT");
    }
  };

  const getKOTStatusColor = (status: KOT["status"]) => {
    switch (status) {
      case "pending":
        return "bg-red-100 text-red-800 border-red-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getItemStatusColor = (status: KOTItem["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "ready":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getKOTStatusIcon = (status: KOT["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <Flame className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const pendingKOTs = kots.filter((k) => k.status !== "completed");
  const completedKOTs = kots.filter((k) => k.status === "completed");

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
              <ChefHat className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Kitchen Orders
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-50">
                {pendingKOTs.length} Active
              </Badge>
            </div>
          </div>

          {/* Filter */}
          <Select
            value={filters.status || "all"}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All KOTs</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KOTs Grid */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading KOTs...</p>
            </div>
          </div>
        ) : kots.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No KOTs
            </h3>
            <p className="text-gray-600">Kitchen is all caught up!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active KOTs */}
            {pendingKOTs.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Active Orders ({pendingKOTs.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingKOTs.map((kot) => {
                    const kotId = kot.id || (kot as any)._id;
                    return (
                      <Card
                        key={kotId}
                        className={cn(
                          "border-2",
                          kot.status === "pending" && "border-red-200",
                          kot.status === "in_progress" && "border-yellow-200"
                        )}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {kot.kotNumber}
                              </CardTitle>
                              {kot.tableNumber && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Table: {kot.tableNumber}
                                </p>
                              )}
                            </div>
                            <Badge
                              className={cn(
                                "flex items-center gap-1",
                                getKOTStatusColor(kot.status)
                              )}
                            >
                              {getKOTStatusIcon(kot.status)}
                              {kot.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(kot.createdAt).toLocaleTimeString()}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Items */}
                          <div className="space-y-2">
                            {kot.items.map((item: any) => (
                              <div
                                key={item._id || Math.random()}
                                className="p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      {item.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Qty: {item.quantity}
                                    </div>
                                    {item.notes && (
                                      <div className="text-sm text-orange-600 mt-1">
                                        Note: {item.notes}
                                      </div>
                                    )}
                                  </div>
                                  <Badge
                                    className={getItemStatusColor(item.status)}
                                  >
                                    {item.status}
                                  </Badge>
                                </div>

                                {/* Item Status Buttons */}
                                {item.status !== "ready" && (
                                  <div className="flex gap-2 mt-2">
                                    {item.status === "pending" && (
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleItemStatusChange(
                                            kotId,
                                            item._id,
                                            "preparing"
                                          )
                                        }
                                        className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                                      >
                                        Start Preparing
                                      </Button>
                                    )}
                                    {item.status === "preparing" && (
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleItemStatusChange(
                                            kotId,
                                            item._id,
                                            "ready"
                                          )
                                        }
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                      >
                                        Mark Ready
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Complete KOT Button */}
                          {kot.items.every(
                            (item: any) => item.status === "ready"
                          ) && (
                            <Button
                              onClick={() => handleKOTComplete(kotId)}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Complete KOT
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed KOTs */}
            {completedKOTs.length > 0 &&
              filters.status !== "pending" &&
              filters.status !== "in_progress" && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Completed ({completedKOTs.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedKOTs.map((kot) => {
                      const kotId = kot.id || (kot as any)._id;
                      return (
                        <Card key={kotId} className="opacity-60">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">
                                  {kot.kotNumber}
                                </CardTitle>
                                {kot.tableNumber && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    Table: {kot.tableNumber}
                                  </p>
                                )}
                              </div>
                              <Badge className={getKOTStatusColor(kot.status)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                COMPLETED
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm text-gray-600">
                              {kot.items.length} items completed
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {kot.completedAt &&
                                new Date(kot.completedAt).toLocaleTimeString()}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
