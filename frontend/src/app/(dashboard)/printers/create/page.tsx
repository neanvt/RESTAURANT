"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { usePrinterStore } from "@/store/printerStore";
import { toast } from "sonner";

export default function CreatePrinterPage() {
  const router = useRouter();
  const { createPrinter } = usePrinterStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    ipAddress: "",
    port: "9100",
    type: "receipt" as "receipt" | "kot" | "label",
    paperSize: "80mm" as "58mm" | "80mm",
    isDefault: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Printer name is required");
      return;
    }

    if (!formData.ipAddress.trim()) {
      toast.error("IP address is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPrinter({
        ...formData,
        port: parseInt(formData.port),
      });
      toast.success("Printer added successfully!");
      router.push("/printers");
    } catch (error: any) {
      toast.error(error.message || "Failed to add printer");
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
              <h1 className="text-xl font-bold text-gray-900">Add Printer</h1>
              <p className="text-sm text-gray-600">Configure a new printer</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Printer className="h-5 w-5 text-blue-600" />
              Printer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">
                Printer Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Main Receipt Printer"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Printer Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "receipt" | "kot" | "label",
                  })
                }
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="receipt">Receipt Printer</option>
                <option value="kot">KOT Printer</option>
                <option value="label">Label Printer</option>
              </select>
            </div>

            <div>
              <Label htmlFor="paperSize">Paper Size</Label>
              <select
                id="paperSize"
                value={formData.paperSize}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paperSize: e.target.value as "58mm" | "80mm",
                  })
                }
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="58mm">58mm</option>
                <option value="80mm">80mm</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connection Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ipAddress">
                IP Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ipAddress"
                value={formData.ipAddress}
                onChange={(e) =>
                  setFormData({ ...formData, ipAddress: e.target.value })
                }
                placeholder="192.168.1.100"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the printer's IP address on your network
              </p>
            </div>

            <div>
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) =>
                  setFormData({ ...formData, port: e.target.value })
                }
                placeholder="9100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default port is 9100 for most network printers
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="isDefault" className="text-base">
                  Set as Default Printer
                </Label>
                <p className="text-sm text-gray-600">
                  Use this printer by default for printing
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isDefault: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Setup Guide</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Ensure the printer is connected to your network</li>
              <li>Find the printer's IP address from its settings</li>
              <li>Test the connection after adding the printer</li>
            </ul>
          </CardContent>
        </Card>

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
                Adding Printer...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Add Printer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
