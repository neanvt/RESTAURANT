"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { usePrinterStore } from "@/store/printerStore";
import { toast } from "sonner";

export default function EditPrinterPage() {
  const router = useRouter();
  const params = useParams();
  const printerId = params.id as string;
  const { printers, updatePrinter, deletePrinter, testPrinter } =
    usePrinterStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    ipAddress: "",
    port: "9100",
    type: "receipt" as "receipt" | "kot" | "label",
    paperSize: "80mm" as "58mm" | "80mm",
    isDefault: false,
  });

  useEffect(() => {
    const printer = printers.find((p) => p._id === printerId);
    if (printer) {
      setFormData({
        name: printer.name,
        ipAddress: printer.ipAddress,
        port: printer.port.toString(),
        type: printer.type,
        paperSize: printer.paperSize,
        isDefault: printer.isDefault,
      });
      setIsLoading(false);
    } else {
      toast.error("Printer not found");
      router.push("/printers");
    }
  }, [printerId, printers, router]);

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await testPrinter(printerId);
      toast.success("Test print sent successfully!");
    } catch (error) {
      toast.error("Failed to send test print");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Printer name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePrinter(printerId, {
        ...formData,
        port: parseInt(formData.port),
      });
      toast.success("Printer updated successfully!");
      router.push("/printers");
    } catch (error: any) {
      toast.error(error.message || "Failed to update printer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this printer?")) return;

    setIsDeleting(true);
    try {
      await deletePrinter(printerId);
      toast.success("Printer deleted successfully");
      router.push("/printers");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete printer");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading printer details...</p>
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
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Printer</h1>
              <p className="text-sm text-gray-600">Update printer settings</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Test Print */}
        <Card>
          <CardContent className="p-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleTest}
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Printing...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Send Test Print
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Printer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Printer Name</Label>
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
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                value={formData.ipAddress}
                onChange={(e) =>
                  setFormData({ ...formData, ipAddress: e.target.value })
                }
                placeholder="192.168.1.100"
                required
              />
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
                  Use this printer by default
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

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-600">
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Delete this printer permanently
            </p>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Printer
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-4 -mx-4 space-y-2">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
