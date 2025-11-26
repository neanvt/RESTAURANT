"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  Plus,
  Check,
  ChevronRight,
  MapPin,
  Phone,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOutletStore } from "@/store/outletStore";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getFullImageUrl } from "@/lib/imageUtils";

export default function OutletsPage() {
  const router = useRouter();
  const { outlets, currentOutlet, isLoading, fetchOutlets, selectOutlet } =
    useOutletStore();
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  const handleSelectOutlet = async (outletId: string) => {
    if (outletId === currentOutlet?._id) return;

    setSwitching(outletId);
    try {
      await selectOutlet(outletId);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to switch outlet:", error);
    } finally {
      setSwitching(null);
    }
  };

  if (isLoading && outlets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading outlets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Outlets</h1>
                <p className="text-sm text-gray-600">
                  Manage your restaurant outlets
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/new-outlet")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Current Outlet Banner */}
        {currentOutlet && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-full">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-blue-900">
                    Current Outlet
                  </div>
                  <div className="text-lg font-bold text-blue-900">
                    {currentOutlet.businessName}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Outlets List */}
        {outlets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Outlets Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first outlet to get started
              </p>
              <Button
                onClick={() => router.push("/new-outlet")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Outlet
              </Button>
            </CardContent>
          </Card>
        ) : (
          outlets.map((outlet) => {
            const isCurrent = outlet._id === currentOutlet?._id;
            const isSwitching = switching === outlet._id;

            return (
              <Card
                key={outlet._id}
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all",
                  isCurrent && "border-blue-500 ring-2 ring-blue-100"
                )}
                onClick={() => !isSwitching && handleSelectOutlet(outlet._id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Logo */}
                    {outlet.logo && getFullImageUrl(outlet.logo) ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                        <Image
                          src={getFullImageUrl(outlet.logo)!}
                          alt={outlet.businessName}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                        {outlet.businessName[0]}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            {outlet.businessName}
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/outlets/${outlet._id}/edit`);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Settings className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {outlet.address.street}, {outlet.address.city},{" "}
                          {outlet.address.state} - {outlet.address.pincode}
                        </span>
                      </div>

                      {/* Contact */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{outlet.contact.phone}</span>
                      </div>

                      {/* Switch Button */}
                      {!isCurrent && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled={isSwitching}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectOutlet(outlet._id);
                            }}
                          >
                            {isSwitching ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                Switching...
                              </>
                            ) : (
                              <>
                                Switch to this outlet
                                <ChevronRight className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
