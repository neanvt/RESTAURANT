"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  Download,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExpenseReportPage() {
  const router = useRouter();

  const expenseData = [
    {
      category: "Ingredients",
      amount: 45000,
      percentage: 45,
      color: "bg-red-500",
    },
    {
      category: "Utilities",
      amount: 15000,
      percentage: 15,
      color: "bg-yellow-500",
    },
    {
      category: "Staff Salaries",
      amount: 30000,
      percentage: 30,
      color: "bg-blue-500",
    },
    { category: "Rent", amount: 8000, percentage: 8, color: "bg-purple-500" },
    {
      category: "Miscellaneous",
      amount: 2000,
      percentage: 2,
      color: "bg-gray-500",
    },
  ];

  const totalExpenses = expenseData.reduce((sum, e) => sum + e.amount, 0);

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
                  Expense Analytics
                </h1>
                <p className="text-sm text-gray-600">Track your spending</p>
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
        {/* Total Expenses */}
        <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ₹{totalExpenses.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Monthly Expenses</div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseData.map((expense) => (
                <div key={expense.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${expense.color}`}
                      ></div>
                      <span className="font-medium">{expense.category}</span>
                    </div>
                    <span className="text-gray-600">{expense.percentage}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${expense.color}`}
                        style={{ width: `${expense.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 min-w-[80px] text-right">
                      ₹{expense.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenseData
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 3)
                .map((expense, index) => (
                  <div
                    key={expense.category}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-full ${expense.color} flex items-center justify-center text-white font-bold text-sm`}
                    >
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {expense.category}
                      </div>
                      <div className="text-xs text-gray-600">
                        {expense.percentage}% of total
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">
                      ₹{expense.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Alert Card */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Budget Alert
                </h3>
                <p className="text-sm text-yellow-800">
                  Ingredient expenses are 15% higher than last month. Consider
                  reviewing supplier contracts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
