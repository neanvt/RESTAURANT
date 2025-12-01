"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  Eye,
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoiceStore } from "@/store/invoiceStore";
import { Invoice } from "@/types/invoice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import DateRangeFilter from "@/components/reports/DateRangeFilter";
import { getTodayLocal, getDaysAgoLocal } from "@/lib/date-utils";

export default function InvoicesPage() {
  const router = useRouter();
  const {
    invoices,
    filters,
    pagination,
    isLoading,
    fetchInvoices,
    updatePaymentStatus,
    setFilters,
  } = useInvoiceStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: getDaysAgoLocal(30),
    endDate: getTodayLocal(),
  });
  const [isDateFilterActive, setIsDateFilterActive] = useState(false);

  useEffect(() => {
    // Initial fetch - load all invoices without date filter
    const loadData = async () => {
      await fetchInvoices();
      setLastUpdated(new Date());
    };
    loadData();

    // Set up auto-refresh every 30 seconds for live data
    const intervalId = setInterval(async () => {
      // If date filter is active, use it in refresh, otherwise fetch all
      if (isDateFilterActive) {
        const currentFilters = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        };
        await fetchInvoices(currentFilters);
      } else {
        await fetchInvoices();
      }
      setLastUpdated(new Date());
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDateFilterActive, dateRange.startDate, dateRange.endDate]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Only filter when search has 3+ characters
    setFilters({ ...filters, search: value.length >= 3 ? value : undefined });
  };

  const handlePaymentStatusFilter = (status: string) => {
    setFilters({
      ...filters,
      paymentStatus: status === "all" ? undefined : (status as any),
    });
  };

  const handlePaymentMethodFilter = (method: string) => {
    setFilters({
      ...filters,
      paymentMethod: method === "all" ? undefined : (method as any),
    });
  };

  const handleApplyDateRange = () => {
    setIsDateFilterActive(true);
    const newFilters = {
      ...filters,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
    fetchInvoices(newFilters);
  };

  const handleClearDateFilter = () => {
    setIsDateFilterActive(false);
    setDateRange({
      startDate: getDaysAgoLocal(30),
      endDate: getTodayLocal(),
    });
    const newFilters = { ...filters };
    delete newFilters.startDate;
    delete newFilters.endDate;
    fetchInvoices(newFilters);
  };

  // Calculate summary stats - ensure invoices exists before calculating
  const totalRevenue = invoices
    ? invoices.reduce((sum, inv) => sum + inv.total, 0)
    : 0;
  const paidRevenue = invoices
    ? invoices
        .filter((inv) => inv.paymentStatus === "paid")
        .reduce((sum, inv) => sum + inv.total, 0)
    : 0;
  const pendingRevenue = invoices
    ? invoices
        .filter((inv) => inv.paymentStatus === "pending")
        .reduce((sum, inv) => sum + inv.total, 0)
    : 0;

  const handleMarkAsPaid = async (id: string) => {
    try {
      await updatePaymentStatus(id, { paymentStatus: "paid" });
      toast.success("Payment status updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update payment status");
    }
  };

  const getPaymentStatusColor = (status: Invoice["paymentStatus"]) => {
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

  const getPaymentStatusIcon = (status: Invoice["paymentStatus"]) => {
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

  const getPaymentMethodLabel = (method: Invoice["paymentMethod"]) => {
    const labels: Record<Invoice["paymentMethod"], string> = {
      cash: "Cash",
      upi: "UPI",
      card: "Card",
      phonepe: "PhonePe",
      googlepay: "Google Pay",
    };
    return labels[method];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Invoices Report
                </h1>
                <p className="text-sm text-gray-600">
                  Track and manage all invoices
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/orders")}
              variant="outline"
              size="sm"
            >
              <Receipt className="h-4 w-4 mr-2" />
              View Orders
            </Button>
          </div>

          {/* Live Indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live
            </div>
            <p className="text-xs text-gray-400" suppressHydrationWarning>
              Last updated:{" "}
              {lastUpdated ? lastUpdated.toLocaleTimeString() : "Loading..."}
            </p>
          </div>

          {/* Date Range Filter */}
          <div className="mb-3">
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <DateRangeFilter
                  value={dateRange}
                  onChange={setDateRange}
                  onApply={handleApplyDateRange}
                />
              </div>
              {isDateFilterActive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearDateFilter}
                  className="text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            {isDateFilterActive && (
              <div className="text-xs text-blue-600 mt-1">
                📅 Filtered by date range
              </div>
            )}
          </div>

          {/* Summary Stats */}
          {invoices && invoices.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="text-xs text-gray-600">Total</div>
                <div className="text-sm font-bold text-gray-900">
                  ₹{totalRevenue.toFixed(0)}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="text-xs text-gray-600">Paid</div>
                <div className="text-sm font-bold text-green-600">
                  ₹{paidRevenue.toFixed(0)}
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-2">
                <div className="text-xs text-gray-600">Pending</div>
                <div className="text-sm font-bold text-yellow-600">
                  ₹{pendingRevenue.toFixed(0)}
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Search invoices or customer name..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <div className="flex gap-2">
              <Select
                value={filters.paymentStatus || "all"}
                onValueChange={handlePaymentStatusFilter}
              >
                <SelectTrigger className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.paymentMethod || "all"}
                onValueChange={handlePaymentMethodFilter}
              >
                <SelectTrigger className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="phonepe">PhonePe</SelectItem>
                  <SelectItem value="googlepay">Google Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading invoices...</p>
            </div>
          </div>
        ) : !invoices || invoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧾</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No invoices found
            </h3>
            <p className="text-gray-600 mb-6">
              Invoices will appear here after generating them from orders
            </p>
            <Button
              onClick={() => router.push("/orders")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              View Orders
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                >
                  {/* Invoice Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {invoice.invoiceNumber}
                        </h3>
                        <Badge
                          className={cn(
                            "flex items-center gap-1",
                            getPaymentStatusColor(invoice.paymentStatus)
                          )}
                        >
                          {getPaymentStatusIcon(invoice.paymentStatus)}
                          {invoice.paymentStatus.toUpperCase()}
                        </Badge>
                      </div>
                      {invoice.customer?.name && (
                        <p className="text-sm text-gray-600">
                          Customer: {invoice.customer.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(invoice.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        ₹{invoice.total.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getPaymentMethodLabel(invoice.paymentMethod)}
                      </div>
                    </div>
                  </div>

                  {/* Invoice Items Summary */}
                  <div className="mb-3 text-sm text-gray-600">
                    {invoice.items.length} item(s) • Subtotal: ₹
                    {invoice.subtotal.toFixed(2)}
                    {invoice.discount?.amount &&
                      invoice.discount.amount > 0 && (
                        <> • Discount: ₹{invoice.discount.amount.toFixed(2)}</>
                      )}
                    {invoice.taxAmount > 0 && (
                      <> • Tax: ₹{invoice.taxAmount.toFixed(2)}</>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/invoices/${invoice._id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>

                    {invoice.paymentStatus === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(invoice._id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark Paid
                      </Button>
                    )}

                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => fetchInvoices(filters, pagination.page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => fetchInvoices(filters, pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
