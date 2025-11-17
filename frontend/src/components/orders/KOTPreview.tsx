"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KOTPreviewProps {
  order: any;
  kot: any;
  outlet: any;
  onClose: () => void;
  onPrintBill: () => void;
}

export default function KOTPreview({
  order,
  kot,
  outlet,
  onClose,
  onPrintBill,
}: KOTPreviewProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Preview</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* KOT Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            {/* Outlet Name */}
            <div className="text-center mb-2">
              <div className="font-bold text-lg">
                {outlet?.businessName || "Restaurant"}
              </div>
              {outlet?.address && typeof outlet.address === "string" && (
                <div className="text-xs text-gray-600">{outlet.address}</div>
              )}
              {outlet?.address && typeof outlet.address === "object" && (
                <div className="text-xs text-gray-600">
                  {[
                    outlet.address.street,
                    outlet.address.city,
                    outlet.address.state,
                    outlet.address.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-gray-300 my-3"></div>

            {/* Date & KOT Info */}
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600">
                {formatDate(kot.createdAt)}
              </div>
              <div className="text-lg font-bold mt-1">
                KOT - {kot.kotNumber}
              </div>
              {order.tableNumber && (
                <div className="text-sm text-gray-600 mt-1">
                  Table No. {order.tableNumber}
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-gray-300 my-4"></div>

            {/* Items */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>Item</span>
                <span>QTY</span>
              </div>
              <div className="border-t border-dashed border-gray-300 my-2"></div>
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm py-1">
                  <span className="flex-1">{item.name}</span>
                  <span className="text-right font-medium">
                    {item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {order.notes && (
              <>
                <div className="border-t border-dashed border-gray-300 my-2"></div>
                <div className="text-xs text-gray-600">
                  <div className="font-semibold mb-1">Notes:</div>
                  <div>{order.notes}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t bg-white flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button
            onClick={onPrintBill}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Print Bill
          </Button>
        </div>
      </div>
    </div>
  );
}
