"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInvoiceStore } from "@/store/invoiceStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;
  const { currentInvoice, getInvoiceById, updatePaymentStatus, isLoading } =
    useInvoiceStore();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getInvoiceById(invoiceId).catch(() => {
      toast.error("Invoice not found");
      router.push("/invoices");
    });
  }, [invoiceId, getInvoiceById, router]);

  const handlePrint = () => {
    window.print();
  };

  const handleMarkAsPaid = async () => {
    try {
      await updatePaymentStatus(invoiceId, { paymentStatus: "paid" });
      toast.success("Payment status updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update payment status");
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "refunded":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "Cash",
      upi: "UPI",
      card: "Card",
      phonepe: "PhonePe",
      googlepay: "Google Pay",
    };
    return labels[method] || method;
  };

  if (isLoading || !currentInvoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden when printing */}
      <div className="bg-white border-b sticky top-0 z-10 print:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Invoice</h1>
                <p className="text-sm text-gray-600">
                  {currentInvoice.invoiceNumber}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {currentInvoice.paymentStatus === "pending" && (
                <Button
                  onClick={handleMarkAsPaid}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Paid
                </Button>
              )}
              <Button onClick={handlePrint} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="p-4 max-w-4xl mx-auto">
        <div
          ref={printRef}
          className="bg-white rounded-lg border print:border-0 print:shadow-none"
        >
          {/* Invoice Header */}
          <div className="p-6 border-b print:border-gray-300">
            <div className="flex justify-between items-start mb-6">
              {/* Business Info */}
              <div className="flex items-start gap-4">
                {currentInvoice?.outlet?.logo?.url && (
                  <div className="w-16 h-16 relative rounded-lg overflow-hidden border">
                    <Image
                      src={currentInvoice.outlet.logo.url}
                      alt={
                        currentInvoice.outlet.businessName || "Business Logo"
                      }
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {currentInvoice.outlet.businessName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {currentInvoice.outlet.name}
                  </p>
                  {currentInvoice.outlet.address && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {currentInvoice.outlet.address}
                    </p>
                  )}
                  {currentInvoice.outlet.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {currentInvoice.outlet.phone}
                    </p>
                  )}
                  {currentInvoice.outlet.gstin && (
                    <p className="text-sm text-gray-600">
                      GSTIN: {currentInvoice.outlet.gstin}
                    </p>
                  )}
                </div>
              </div>

              {/* Invoice Info */}
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">INVOICE</div>
                <div className="text-xl font-bold text-gray-900 mb-2">
                  {currentInvoice.invoiceNumber}
                </div>
                <Badge
                  className={cn(
                    "flex items-center gap-1 w-fit ml-auto",
                    getPaymentStatusColor(currentInvoice.paymentStatus)
                  )}
                >
                  {getPaymentStatusIcon(currentInvoice.paymentStatus)}
                  {currentInvoice.paymentStatus.toUpperCase()}
                </Badge>
                <div className="text-sm text-gray-600 mt-2">
                  Date:{" "}
                  {new Date(currentInvoice.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            {currentInvoice.customer?.name && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Bill To:
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium">
                    {currentInvoice.customer.name}
                  </div>
                  {currentInvoice.customer.phone && (
                    <div>Phone: {currentInvoice.customer.phone}</div>
                  )}
                  {currentInvoice.customer.address && (
                    <div>{currentInvoice.customer.address}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Invoice Items */}
          <div className="p-6 border-b print:border-gray-300">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-semibold text-gray-900">
                    Item
                  </th>
                  <th className="text-center py-2 text-sm font-semibold text-gray-900">
                    Qty
                  </th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-900">
                    Tax
                  </th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-900">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentInvoice.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 text-sm text-gray-900">
                      {item.item.name}
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-center">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-right">
                      ₹{item.price.toFixed(2)}
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-right">
                      ₹{item.taxAmount.toFixed(2)}
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-900 text-right">
                      ₹{item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Summary */}
          <div className="p-6">
            <div className="flex justify-between items-start">
              {/* Payment Info & QR Code */}
              <div className="flex-1">
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-900 mb-1">
                    Payment Method
                  </div>
                  <div className="text-sm text-gray-600">
                    {getPaymentMethodLabel(currentInvoice.paymentMethod)}
                  </div>
                </div>

                {/* UPI QR Code */}
                {currentInvoice.paymentMethod !== "cash" &&
                  currentInvoice.upiQRCode && (
                    <div className="print:block">
                      <div className="text-sm font-semibold text-gray-900 mb-2">
                        Scan to Pay
                      </div>
                      <div className="relative w-48 h-48 border rounded-lg overflow-hidden">
                        <Image
                          src={currentInvoice.upiQRCode}
                          alt="UPI QR Code"
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                    </div>
                  )}

                {currentInvoice.notes && (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-900 mb-1">
                      Notes
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentInvoice.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="w-80">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      ₹{currentInvoice.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {currentInvoice.discount.amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>
                        Discount (
                        {currentInvoice.discount.type === "percentage"
                          ? `${currentInvoice.discount.value}%`
                          : "Fixed"}
                        )
                      </span>
                      <span>-₹{currentInvoice.discount.amount.toFixed(2)}</span>
                    </div>
                  )}

                  {currentInvoice.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">
                        ₹{currentInvoice.taxAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{currentInvoice.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t print:border-gray-300 text-center text-sm text-gray-600">
            Thank you for your business!
          </div>
        </div>
      </div>
    </div>
  );
}
