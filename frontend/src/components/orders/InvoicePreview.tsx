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

        {/* Invoice Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 print:p-0 print:bg-white print:overflow-visible">
          <div className="bg-white p-4 rounded-lg shadow-sm receipt-print font-source-sans print-invoice print:p-2 print:shadow-none print:rounded-none">
            {/* Outlet Logo & Info */}
            {outlet?.logo && getFullImageUrl(outlet.logo) && (
              <div className="flex justify-center mb-3 no-print-large">
                <img
                  src={getFullImageUrl(outlet.logo)!}
                  alt={outlet.businessName}
                  className="max-w-[160px] max-h-16 object-contain"
                />
              </div>
            )}

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
              {outlet?.phone && (
                <div className="print-compact text-gray-600 mt-1">
                  Phone: {outlet.phone}
                </div>
              )}
            </div>

            <div className="receipt-separator"></div>

            {/* Invoice Info */}
            <div className="text-center mb-3">
              <div className="receipt-title font-medium text-gray-900">
                Invoice
              </div>
            </div>

            <div className="flex justify-between print-compact mb-2 text-gray-700">
              <div>
                <div className="font-light">
                  {invoice.paymentMethod || "Cash Sale"}
                </div>
              </div>
              <div className="text-right space-y-0.5">
                <div className="font-light">
                  Date: {formatDate(invoice.createdAt).split(",")[0]}
                </div>
                <div className="font-light">
                  Time: {formatDate(invoice.createdAt).split(",")[1]}
                </div>
                <div className="font-medium text-gray-900">
                  Invoice no: {invoice.invoiceNumber}
                </div>
              </div>
            </div>

            <div className="receipt-separator"></div>

            {/* Items Table */}
            <table className="w-full receipt-body">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-1 print-small font-medium text-gray-800">
                    Item Name
                  </th>
                  <th className="text-right py-1 print-small font-medium text-gray-800">
                    Price
                  </th>
                  <th className="text-right py-1 print-small font-medium text-gray-800">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, index: number) => (
                  <tr
                    key={index}
                    className="border-b border-dashed border-gray-200"
                  >
                    <td className="py-1.5">
                      <div className="print-small font-light text-gray-900">
                        {item.name}
                      </div>
                      <div className="print-compact text-gray-500 font-light">
                        x{item.quantity}
                      </div>
                    </td>
                    <td className="text-right print-small font-light text-gray-900">
                      {item.price.toFixed(2)}
                    </td>
                    <td className="text-right print-small font-medium text-gray-900">
                      {item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="receipt-separator"></div>

            {/* Totals */}
            <div className="space-y-1 print-small text-gray-700">
              <div className="flex justify-between">
                <span className="font-light">Subtotal</span>
                <span className="font-medium text-gray-900">
                  ₹{invoice.subtotal.toFixed(2)}
                </span>
              </div>
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="font-light">Tax</span>
                  <span className="font-medium text-gray-900">
                    ₹{invoice.taxAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between receipt-total pt-1 border-t border-gray-300">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900">
                  ₹{invoice.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* QR Code - Use backend generated QR with outlet's UPI details */}
            {qrCode && (
              <div className="mt-4 text-center">
                <img
                  src={qrCode}
                  alt="Payment QR"
                  className="w-32 h-32 mx-auto"
                />
                <div className="print-compact text-gray-600 mt-1 font-light">
                  Scan this QR code to pay
                </div>
              </div>
            )}

            <div className="receipt-separator"></div>

            {/* Footer */}
            <div className="text-center print-compact text-gray-600">
              <div className="font-medium text-gray-800 mb-1">
                Terms & Conditions
              </div>
              <div className="font-light">
                Thank you for doing business with us.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t bg-white flex gap-3 print-hide">
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
