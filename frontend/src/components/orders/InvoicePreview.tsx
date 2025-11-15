"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFullImageUrl } from "@/lib/imageUtils";

interface InvoicePreviewProps {
  order: any;
  invoice: any;
  outlet: any;
  qrCode?: string;
  onClose: () => void;
  onPrintInvoice: () => void;
}

export default function InvoicePreview({
  order,
  invoice,
  outlet,
  qrCode,
  onClose,
  onPrintInvoice,
}: InvoicePreviewProps) {
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

        {/* Invoice Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            {/* Outlet Logo & Info */}
            {outlet?.logo && getFullImageUrl(outlet.logo) && (
              <div className="flex justify-center mb-4">
                <img
                  src={getFullImageUrl(outlet.logo)!}
                  alt={outlet.businessName}
                  className="max-w-[200px] max-h-24 object-contain"
                />
              </div>
            )}

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
              {outlet?.phone && (
                <div className="text-xs text-gray-600">
                  Phone: {outlet.phone}
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-gray-300 my-4"></div>

            {/* Invoice Info */}
            <div className="text-center mb-4">
              <div className="font-bold">Tax Invoice</div>
            </div>

            <div className="flex justify-between text-xs mb-2">
              <div>
                <div className="text-gray-600">
                  {invoice.paymentMethod || "Cash Sale"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-600">
                  Date: {formatDate(invoice.createdAt).split(",")[0]}
                </div>
                <div className="text-gray-600">
                  Time: {formatDate(invoice.createdAt).split(",")[1]}
                </div>
                <div className="text-gray-600">
                  Invoice no: {invoice.invoiceNumber}
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-300 my-4"></div>

            {/* Items Table */}
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Item Name</th>
                  <th className="text-right py-1">Price</th>
                  <th className="text-right py-1">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-dashed">
                    <td className="py-2">
                      <div>{item.name}</div>
                      <div className="text-gray-500">x{item.quantity}</div>
                    </td>
                    <td className="text-right">{item.price.toFixed(2)}</td>
                    <td className="text-right">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-gray-300 my-4"></div>

            {/* Totals */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{invoice.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total</span>
                <span>₹{invoice.total.toFixed(2)}</span>
              </div>
            </div>

            {/* QR Code - Use backend generated QR with outlet's UPI details */}
            {qrCode && (
              <div className="mt-6 text-center">
                <img
                  src={qrCode}
                  alt="Payment QR"
                  className="w-40 h-40 mx-auto"
                />
                <div className="text-xs text-gray-600 mt-2">
                  Scan this QR code to pay
                </div>
              </div>
            )}

            <div className="border-t border-dashed border-gray-300 my-4"></div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-600">
              <div className="font-semibold">Terms & Conditions</div>
              <div>Thank you for doing business with us.</div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t bg-white flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button
            onClick={onPrintInvoice}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}
