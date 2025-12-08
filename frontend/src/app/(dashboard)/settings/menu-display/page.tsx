"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Clock, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useOutletStore } from "@/store/outletStore";
import { toast } from "sonner";

export default function MenuDisplaySettingsPage() {
  const router = useRouter();
  const { currentOutlet, updateOutlet, fetchCurrentOutlet } = useOutletStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    timingText: "",
    closedDay: "",
    deliveryEnabled: true,
    minimumOrder: 300,
    deliveryCharge: 30,
    freeDeliveryAbove: 500,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCurrentOutlet();
      } catch (error) {
        toast.error("Failed to load menu display settings");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchCurrentOutlet]);

  // Update form when currentOutlet changes
  useEffect(() => {
    if (currentOutlet) {
      setFormData({
        timingText:
          currentOutlet.menuDisplaySettings?.timingText || "4:00PM to 8:30PM",
        closedDay: currentOutlet.menuDisplaySettings?.closedDay || "Monday",
        deliveryEnabled: currentOutlet.deliveryConfig?.enabled ?? true,
        minimumOrder: currentOutlet.deliveryConfig?.minimumOrder || 300,
        deliveryCharge: currentOutlet.deliveryConfig?.deliveryCharge || 30,
        freeDeliveryAbove:
          currentOutlet.deliveryConfig?.freeDeliveryAbove || 500,
      });
    }
  }, [currentOutlet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.timingText.trim()) {
      toast.error("Please enter timing text");
      return;
    }

    if (!formData.closedDay.trim()) {
      toast.error("Please enter closed day");
      return;
    }

    if (formData.deliveryEnabled) {
      if (formData.minimumOrder < 0) {
        toast.error("Minimum order amount cannot be negative");
        return;
      }
      if (formData.deliveryCharge < 0) {
        toast.error("Delivery charge cannot be negative");
        return;
      }
      if (formData.freeDeliveryAbove < 0) {
        toast.error("Free delivery threshold cannot be negative");
        return;
      }
    }

    if (!currentOutlet?._id) {
      toast.error("No outlet selected");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        menuDisplaySettings: {
          timingText: formData.timingText.trim(),
          closedDay: formData.closedDay.trim(),
        },
        deliveryConfig: {
          enabled: formData.deliveryEnabled,
          minimumOrder: Number(formData.minimumOrder),
          deliveryCharge: Number(formData.deliveryCharge),
          freeDeliveryAbove: Number(formData.freeDeliveryAbove),
        },
      };

      await updateOutlet(currentOutlet._id, updateData);
      toast.success("Menu display settings updated successfully");
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Menu Display Settings
              </h1>
              <p className="text-sm text-gray-600">
                Configure printed menu footer
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Timing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timingText">
                Timing Text <span className="text-red-500">*</span>
              </Label>
              <Input
                id="timingText"
                placeholder="e.g., 4:00PM to 8:30PM"
                value={formData.timingText}
                onChange={(e) =>
                  setFormData({ ...formData, timingText: e.target.value })
                }
                required
              />
              <p className="text-xs text-gray-500">
                This will appear in the menu footer
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="closedDay">
                Closed Day <span className="text-red-500">*</span>
              </Label>
              <Input
                id="closedDay"
                placeholder="e.g., Monday"
                value={formData.closedDay}
                onChange={(e) =>
                  setFormData({ ...formData, closedDay: e.target.value })
                }
                required
              />
              <p className="text-xs text-gray-500">
                Day when restaurant is closed
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Preview:</strong> Timing: {formData.timingText} (
                {formData.closedDay} Off)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Home Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Home Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="deliveryEnabled">Enable Home Delivery</Label>
                <p className="text-xs text-gray-500">
                  Show delivery info on printed menu
                </p>
              </div>
              <Switch
                id="deliveryEnabled"
                checked={formData.deliveryEnabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, deliveryEnabled: checked })
                }
              />
            </div>

            {formData.deliveryEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="minimumOrder">Minimum Order (₹)</Label>
                  <Input
                    id="minimumOrder"
                    type="number"
                    min="0"
                    placeholder="300"
                    value={formData.minimumOrder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimumOrder: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryCharge">Delivery Charge (₹)</Label>
                  <Input
                    id="deliveryCharge"
                    type="number"
                    min="0"
                    placeholder="30"
                    value={formData.deliveryCharge}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryCharge: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freeDeliveryAbove">
                    Free Delivery Above (₹)
                  </Label>
                  <Input
                    id="freeDeliveryAbove"
                    type="number"
                    min="0"
                    placeholder="500"
                    value={formData.freeDeliveryAbove}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        freeDeliveryAbove: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900 font-semibold mb-1">
                    Preview:
                  </p>
                  <p className="text-sm text-blue-900">Home Delivery</p>
                  <p className="text-xs text-blue-800">
                    Min: ₹{formData.minimumOrder} (₹{formData.deliveryCharge}{" "}
                    charge)
                  </p>
                  <p className="text-xs text-blue-800">
                    Above ₹{formData.freeDeliveryAbove} (Free)
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
