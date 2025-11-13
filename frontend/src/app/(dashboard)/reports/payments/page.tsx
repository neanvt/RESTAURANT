"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Smartphone,
  Download,
  Calendar,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportStore } from "@/store/reportStore";
import DateRangeFilter from "@/components/reports/DateRangeFilter";
import { getTodayLocal, getDaysAgoLocal } from "@/lib/date-utils";

const getPaymentIcon = (method: string) => {
  const methodLower = method?.toLowerCase() || "";
  if (methodLower.includes("cash")) return Wallet;
  if (methodLower.includes("upi")) return Smartphone;
  if (
    methodLower.includes("card") ||
    methodLower.includes("credit") ||
    methodLower.includes("debit")
  )
    return CreditCard;
  return Banknote;
};

const getPaymentColor = (index: number) => {
  const colors = [
    "bg-green-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];
  return colors[index % colors.length];
};

export default function PaymentReportPage() {
  const router = useRouter();
  const { paymentMethods, isLoading, fetchPaymentMethodReport } =
    useReportStore();
  const [dateRange, setDateRange] = useState({
    startDate: getDaysAgoLocal(30),
    endDate: getTodayLocal(),
  });

  useEffect(() => {
    fetchPaymentMethodReport(dateRange);
  }, [dateRange.startDate, dateRange.endDate]);

  const handleApplyDateRange = () => {
    fetchPaymentMethodReport(dateRange);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  const totalAmount = paymentMethods.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalCount = paymentMethods.reduce((sum, p) => sum + p.count, 0);

  const paymentData = paymentMethods.map((payment, index) => {
    const percentage =
      totalAmount > 0 ? (payment.totalAmount / totalAmount) * 100 : 0;
    return {
      method: payment._id || "Unknown",
      icon: getPaymentIcon(payment._id),
      amount: payment.totalAmount,
      count: payment.count,
      percentage,
      avgAmount: payment.averageAmount,
      color: getPaymentColor(index),
    };
  });

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
                <h1 className="text-xl font-bold text-gray-900">
                  Payment Methods
                </h1>
                <p className="text-sm text-gray-600">Payment analysis</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Date Range Filter */}
        <DateRangeFilter
          value={dateRange}
          onChange={setDateRange}
          onApply={handleApplyDateRange}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">
                ₹{totalAmount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Total Collection</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">
                {totalCount}
              </div>
              <div className="text-xs text-gray-600">Total Transactions</div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Distribution */}
        {paymentData.length > 0 ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Payment Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentData.map((payment) => (
                    <div key={payment.method} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${payment.color}`}
                          ></div>
                          <span className="font-medium">{payment.method}</span>
                        </div>
                        <span className="text-gray-600">
                          {payment.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${payment.color}`}
                          style={{ width: `${payment.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Cards */}
            <div className="space-y-3">
              {paymentData.map((payment) => {
                const Icon = payment.icon;

                return (
                  <Card key={payment.method}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-lg ${payment.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-lg mb-3">
                            {payment.method}
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <div className="text-xs text-gray-600">
                                Amount
                              </div>
                              <div className="font-bold text-gray-900">
                                ₹{payment.amount.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600">Count</div>
                              <div className="font-bold text-gray-900">
                                {payment.count}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600">Avg</div>
                              <div className="font-bold text-gray-900">
                                ₹{Math.round(payment.avgAmount)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No Data Available
              </h3>
              <p className="text-sm text-gray-600">
                No payment data found for the selected period
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
