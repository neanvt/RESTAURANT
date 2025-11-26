"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KOTPreviewProps {
  order: any;
  kot: any;
  outlet: any;
  onClose: () => void;
  onPrintBill: () => void;
  onPrintKOT?: () => void; // Optional for backward compatibility
}

export default function KOTPreview({
  order,
  kot,
  outlet,
  onClose,
  onPrintBill,
  onPrintKOT,
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:bg-white print:static print:p-0">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col print:max-w-full print:max-h-full print:rounded-none print:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b print-hide">
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
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 print:p-0 print:bg-white print:overflow-visible">
          <div className="bg-white p-4 rounded-lg shadow-sm receipt-print font-source-sans print-kot print:p-2 print:shadow-none print:rounded-none">
            {/* Outlet Name */}
            <div className="text-center mb-3">
              <div className="receipt-header text-base font-semibold text-gray-900">
                {outlet?.businessName || "Restaurant"}
              </div>
              {outlet?.address && typeof outlet.address === "string" && (
                <div className="print-compact text-gray-600 mt-1">
                  {outlet.address}
                </div>
              )}
              {outlet?.address && typeof outlet.address === "object" && (
                <div className="print-compact text-gray-600 mt-1">
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

            <div className="receipt-separator"></div>

            {/* Date & KOT Info */}
            <div className="text-center mb-3">
              <div className="print-small text-gray-600">
                {formatDate(kot.createdAt)}
              </div>
              <div className="receipt-title text-gray-900 font-medium mt-1">
                KOT - {kot.kotNumber}
              </div>
              {order.tableNumber && (
                <div className="print-small text-gray-600 mt-1">
                  Table No. {order.tableNumber}
                </div>
              )}
            </div>

            <div className="receipt-separator"></div>

            {/* Items */}
            <div className="space-y-1">
              <div className="flex justify-between print-small font-medium text-gray-800">
                <span>Item</span>
                <span>QTY</span>
              </div>
              <div className="receipt-separator"></div>
              {order.items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between print-compact py-0.5 text-gray-900"
                >
                  <span className="flex-1 font-light">{item.name}</span>
                  <span className="text-right font-medium text-sm ml-2">
                    {item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {order.notes && (
              <>
                <div className="receipt-separator"></div>
                <div className="print-compact text-gray-700">
                  <div className="font-medium mb-1 text-gray-800">Notes:</div>
                  <div className="font-light italic">{order.notes}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t bg-white flex gap-3 print-hide">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          {onPrintKOT && (
            <Button
              onClick={onPrintKOT}
              variant="outline"
              className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              Print KOT
            </Button>
          )}
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
