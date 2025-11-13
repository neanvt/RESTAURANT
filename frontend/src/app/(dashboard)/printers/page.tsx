"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Printer,
  Plus,
  Settings,
  PlayCircle,
  Wifi,
  WifiOff,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePrinterStore } from "@/store/printerStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PrintersPage() {
  const router = useRouter();
  const { printers, isLoading, fetchPrinters, testPrinter, deletePrinter } =
    usePrinterStore();

  useEffect(() => {
    fetchPrinters();
  }, [fetchPrinters]);

  const handleTest = async (printerId: string, printerName: string) => {
    try {
      await testPrinter(printerId);
      toast.success(`Test print sent to ${printerName}`);
    } catch (error) {
      toast.error("Failed to send test print");
    }
  };

  const handleDelete = async (printerId: string, printerName: string) => {
    if (!confirm(`Are you sure you want to delete ${printerName}?`)) return;

    try {
      await deletePrinter(printerId);
      toast.success("Printer deleted successfully");
    } catch (error) {
      toast.error("Failed to delete printer");
    }
  };

  if (isLoading && printers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading printers...</p>
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
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Printers</h1>
                <p className="text-sm text-gray-600">
                  {printers.length} printer{printers.length !== 1 ? "s" : ""}{" "}
                  configured
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/printers/create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Print Queue Link */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-white border-blue-200"
          onClick={() => router.push("/printers/queue")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Printer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Print Queue</div>
                  <div className="text-sm text-gray-600">
                    View pending print jobs
                  </div>
                </div>
              </div>
              <Badge variant="secondary">0 jobs</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Printers List */}
        {printers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Printer className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Printers Configured
              </h3>
              <p className="text-gray-600 mb-4">
                Add a printer to start printing receipts and KOTs
              </p>
              <Button
                onClick={() => router.push("/printers/create")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Printer
              </Button>
            </CardContent>
          </Card>
        ) : (
          printers.map((printer) => (
            <Card
              key={printer._id}
              className={cn(
                "hover:shadow-md transition-shadow",
                printer.isDefault && "border-blue-500 ring-2 ring-blue-100"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                      printer.isOnline ? "bg-green-100" : "bg-gray-100"
                    )}
                  >
                    <Printer
                      className={cn(
                        "h-6 w-6",
                        printer.isOnline ? "text-green-600" : "text-gray-400"
                      )}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {printer.name}
                          {printer.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {printer.ipAddress}:{printer.port}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {printer.type.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {printer.paperSize}
                      </Badge>
                      <div
                        className={cn(
                          "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                          printer.isOnline
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {printer.isOnline ? (
                          <>
                            <Wifi className="h-3 w-3" />
                            Online
                          </>
                        ) : (
                          <>
                            <WifiOff className="h-3 w-3" />
                            Offline
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(printer._id, printer.name)}
                      >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/printers/${printer._id}/edit`)
                        }
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(printer._id, printer.name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
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
