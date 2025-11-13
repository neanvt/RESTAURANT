"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Download, CreditCard, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  plan: string;
  paymentMethod: string;
  invoiceNumber: string;
}

export default function BillingHistoryPage() {
  const router = useRouter();

  const invoices: Invoice[] = [
    {
      id: "1",
      date: "2024-11-01",
      amount: 2999,
      status: "paid",
      plan: "Professional - Monthly",
      paymentMethod: "UPI",
      invoiceNumber: "INV-2024-001",
    },
    {
      id: "2",
      date: "2024-10-01",
      amount: 2999,
      status: "paid",
      plan: "Professional - Monthly",
      paymentMethod: "UPI",
      invoiceNumber: "INV-2024-002",
    },
    {
      id: "3",
      date: "2024-09-01",
      amount: 2999,
      status: "paid",
      plan: "Professional - Monthly",
      paymentMethod: "UPI",
      invoiceNumber: "INV-2024-003",
    },
    {
      id: "4",
      date: "2024-08-01",
      amount: 999,
      status: "paid",
      plan: "Basic - Monthly",
      paymentMethod: "Card",
      invoiceNumber: "INV-2024-004",
    },
  ];

  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDownload = (invoice: Invoice) => {
    // In a real app, this would trigger PDF download
    alert(`Downloading invoice ${invoice.invoiceNumber}`);
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
                Billing History
              </h1>
              <p className="text-sm text-gray-600">View past invoices</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-sm opacity-90 mb-1">
                Total Paid (All Time)
              </div>
              <div className="text-3xl font-bold">
                ₹{totalPaid.toLocaleString()}
              </div>
              <div className="text-sm opacity-90 mt-2">
                {invoices.length} invoices
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">UPI</div>
                  <div className="text-sm text-gray-600">
                    Default payment method
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Invoices</h2>

          {invoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">
                      {invoice.plan}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(invoice.date)}
                    </div>
                  </div>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Invoice #</div>
                    <div className="text-sm font-medium">
                      {invoice.invoiceNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600 mb-1">Amount</div>
                    <div className="text-lg font-bold text-gray-900">
                      ₹{invoice.amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <CreditCard className="h-4 w-4" />
                    <span>{invoice.paymentMethod}</span>
                  </div>
                  {invoice.status === "paid" && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Paid</span>
                    </div>
                  )}
                </div>

                {invoice.status === "paid" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => handleDownload(invoice)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              If you have questions about billing or need assistance with an
              invoice, our support team is here to help.
            </p>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
