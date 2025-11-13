"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useOutletStore } from "@/store/outletStore";
import { toast } from "sonner";

interface DayHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export default function OperatingHoursPage() {
  const router = useRouter();
  const { currentOutlet, updateOutlet } = useOutletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hours, setHours] = useState<DayHours[]>([
    { day: "Monday", isOpen: true, openTime: "09:00", closeTime: "22:00" },
    { day: "Tuesday", isOpen: true, openTime: "09:00", closeTime: "22:00" },
    { day: "Wednesday", isOpen: true, openTime: "09:00", closeTime: "22:00" },
    { day: "Thursday", isOpen: true, openTime: "09:00", closeTime: "22:00" },
    { day: "Friday", isOpen: true, openTime: "09:00", closeTime: "23:00" },
    { day: "Saturday", isOpen: true, openTime: "09:00", closeTime: "23:00" },
    { day: "Sunday", isOpen: true, openTime: "10:00", closeTime: "22:00" },
  ]);

  useEffect(() => {
    // Load operating hours from outlet settings if available
    // This would come from the backend in a real implementation
  }, [currentOutlet]);

  const handleDayToggle = (index: number) => {
    const newHours = [...hours];
    newHours[index].isOpen = !newHours[index].isOpen;
    setHours(newHours);
  };

  const handleTimeChange = (
    index: number,
    field: "openTime" | "closeTime",
    value: string
  ) => {
    const newHours = [...hours];
    newHours[index][field] = value;
    setHours(newHours);
  };

  const handleApplyToAll = () => {
    const firstDay = hours[0];
    const newHours = hours.map((day) => ({
      ...day,
      isOpen: firstDay.isOpen,
      openTime: firstDay.openTime,
      closeTime: firstDay.closeTime,
    }));
    setHours(newHours);
    toast.success("Applied to all days");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOutlet) {
      toast.error("No outlet selected");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real implementation, this would save to backend
      // For now, we'll just simulate success
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Operating hours updated successfully!");
      router.push("/settings");
    } catch (error: any) {
      toast.error(error.message || "Failed to update operating hours");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Operating Hours
              </h1>
              <p className="text-sm text-gray-600">
                Set your restaurant's business hours
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyToAll}
              className="w-full"
            >
              <Clock className="h-4 w-4 mr-2" />
              Apply Monday's hours to all days
            </Button>
          </CardContent>
        </Card>

        {/* Days */}
        {hours.map((dayHours, index) => (
          <Card key={dayHours.day}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {dayHours.day}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={`toggle-${index}`}
                    className="text-sm text-gray-600"
                  >
                    {dayHours.isOpen ? "Open" : "Closed"}
                  </Label>
                  <Switch
                    id={`toggle-${index}`}
                    checked={dayHours.isOpen}
                    onCheckedChange={() => handleDayToggle(index)}
                  />
                </div>
              </div>
            </CardHeader>
            {dayHours.isOpen && (
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`open-${index}`} className="text-sm">
                      Opening Time
                    </Label>
                    <Input
                      id={`open-${index}`}
                      type="time"
                      value={dayHours.openTime}
                      onChange={(e) =>
                        handleTimeChange(index, "openTime", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`close-${index}`} className="text-sm">
                      Closing Time
                    </Label>
                    <Input
                      id={`close-${index}`}
                      type="time"
                      value={dayHours.closeTime}
                      onChange={(e) =>
                        handleTimeChange(index, "closeTime", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Open from {dayHours.openTime} to {dayHours.closeTime}
                </p>
              </CardContent>
            )}
          </Card>
        ))}

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-white border-t p-4 -mx-4">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
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
                Save Operating Hours
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
