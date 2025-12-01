"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, Check, RefreshCw, LogOut, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useOutletStore } from "@/store/outletStore";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import Image from "next/image";
import { getFullImageUrl } from "@/lib/imageUtils";

interface OutletSelectorModalProps {
  isOpen: boolean;
  onClose?: () => void;
  showLogout?: boolean;
}

export default function OutletSelectorModal({
  isOpen,
  onClose,
  showLogout = true,
}: OutletSelectorModalProps) {
  const router = useRouter();
  const { outlets, currentOutlet, isLoading, fetchOutlets, selectOutlet } =
    useOutletStore();
  const { user, logout } = useAuthStore();
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOutlets();
    }
  }, [isOpen, fetchOutlets]);

  const handleSelectOutlet = async (outletId: string) => {
    if (outletId === currentOutlet?._id) {
      onClose?.();
      return;
    }

    setSwitching(outletId);
    try {
      await selectOutlet(outletId);
      toast.success("Outlet switched successfully");
      onClose?.();
      // Refresh the page to load data for new outlet
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to switch outlet");
    } finally {
      setSwitching(null);
    }
  };

  const handleCreateOutlet = () => {
    onClose?.();
    router.push("/create-outlet");
  };

  const handleRefresh = () => {
    fetchOutlets();
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleEditOutlet = (outletId: string) => {
    onClose?.();
    router.push(`/outlets/${outletId}/edit`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] rounded-2xl p-0">
        <VisuallyHidden>
          <DialogTitle>Select Outlet</DialogTitle>
          <DialogDescription>
            Choose an outlet to manage or create a new one
          </DialogDescription>
        </VisuallyHidden>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Select an Outlet
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Store className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">You Are Logged In With</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.phone}
                </p>
              </div>
            </div>
          )}

          {/* My Outlets Section */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              My Outlets
            </h3>

            {isLoading && outlets.length === 0 ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading outlets...</p>
              </div>
            ) : outlets.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <Store className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  No Outlets Yet
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Create your first outlet to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {outlets.map((outlet) => {
                  const isCurrent = outlet._id === currentOutlet?._id;
                  const isSwitchingThis = switching === outlet._id;

                  return (
                    <button
                      key={outlet._id}
                      onClick={() => handleSelectOutlet(outlet._id)}
                      disabled={isSwitchingThis}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        isCurrent
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Outlet Icon/Logo */}
                        {outlet.logo && getFullImageUrl(outlet.logo) ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                            <Image
                              src={outlet.logo}
                              alt={outlet.businessName}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Store className="h-6 w-6 text-blue-600" />
                          </div>
                        )}

                        {/* Outlet Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 truncate">
                              {outlet.businessName}
                            </p>
                            {isCurrent && (
                              <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-green-600 font-medium">
                            SYNC ON
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-auto">
                          {/* Edit Button */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditOutlet(outlet._id);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            title="Edit outlet"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                handleEditOutlet(outlet._id);
                              }
                            }}
                          >
                            <Settings className="h-4 w-4 text-gray-600" />
                          </div>

                          {/* Current Badge */}
                          {isCurrent && (
                            <div className="p-2 bg-blue-600 rounded-full">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create New Outlet Button */}
          <Button
            onClick={handleCreateOutlet}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl mb-3"
            size="lg"
          >
            Create New Outlet
          </Button>

          {/* Logout Button */}
          {showLogout && (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full font-semibold py-6 rounded-xl border-2"
              size="lg"
            >
              Logout
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
