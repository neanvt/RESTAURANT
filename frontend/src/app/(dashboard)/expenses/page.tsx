"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getExpenses, deleteExpense } from "@/lib/api/expenses";
import type { Expense, ExpenseFilters } from "@/types/expense";
import { PAYMENT_METHODS } from "@/types/expense";
import { getTodayLocal, getDaysAgoLocal } from "@/lib/date-utils";
import DateRangeFilter from "@/components/reports/DateRangeFilter";

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>({
    startDate: getDaysAgoLocal(30),
    endDate: getTodayLocal(),
  });

  useEffect(() => {
    loadExpenses();
  }, [
    filters.category,
    filters.paymentMethod,
    filters.startDate,
    filters.endDate,
  ]);

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (filters.search !== undefined) {
        loadExpenses();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters.search]);

  const loadExpenses = async () => {
    try {
      setLoading(true);

      // Clean filters - remove undefined values
      const cleanFilters: ExpenseFilters = {};
      if (filters.startDate) cleanFilters.startDate = filters.startDate;
      if (filters.endDate) cleanFilters.endDate = filters.endDate;
      if (filters.category) cleanFilters.category = filters.category;
      if (filters.paymentMethod)
        cleanFilters.paymentMethod = filters.paymentMethod;
      if (filters.search) cleanFilters.search = filters.search;

      console.log("Applying filters:", cleanFilters);
      const data = await getExpenses(cleanFilters);
      setExpenses(data);

      // Extract unique categories from all expenses (fetch without filters for categories)
      if (!filters.category && !filters.paymentMethod && !filters.search) {
        const uniqueCategories = [...new Set(data.map((e) => e.category))];
        setCategories(uniqueCategories.sort());
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      await deleteExpense(id);
      toast.success("Expense deleted successfully");
      loadExpenses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete expense");
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCategoryLabel = (category: string) => {
    return category;
  };

  const getPaymentMethodLabel = (method: string) => {
    return PAYMENT_METHODS.find((m) => m.value === method)?.label || method;
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">Expenses</h1>
            <button
              onClick={() => router.push("/expenses/create")}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg"
            >
              + Add Expense
            </button>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Count</p>
                <p className="text-lg font-semibold">{expenses.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 space-y-3">
          {/* Date Range */}
          <DateRangeFilter
            value={{
              startDate:
                typeof filters.startDate === "string"
                  ? filters.startDate
                  : filters.startDate?.toISOString().split("T")[0] ||
                    getTodayLocal(),
              endDate:
                typeof filters.endDate === "string"
                  ? filters.endDate
                  : filters.endDate?.toISOString().split("T")[0] ||
                    getTodayLocal(),
            }}
            onChange={(dateRange) => {
              setFilters({
                ...filters,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
              });
            }}
          />

          {/* Category and Payment Method */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <select
              value={filters.category || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFilters({
                  ...filters,
                  category: value || undefined,
                });
              }}
              className="px-3 py-1.5 text-sm border rounded-lg bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={filters.paymentMethod || ""}
              onChange={(e) => {
                const value = e.target.value;
                setFilters({
                  ...filters,
                  paymentMethod: value ? (value as any) : undefined,
                });
              }}
              className="px-3 py-1.5 text-sm border rounded-lg bg-white"
            >
              <option value="">All Payment Methods</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search || ""}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full px-3 py-2 text-sm border rounded-lg"
          />
        </div>
      </div>

      {/* Expense List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No expenses found. Add your first expense!
          </div>
        ) : (
          expenses.map((expense) => (
            <div
              key={expense._id}
              className="bg-white rounded-lg p-4 border shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                      {getCategoryLabel(expense.category)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {expense.description}
                  </p>
                  {(expense.price || expense.quantity) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {expense.price && `₹${expense.price} per unit`}
                      {expense.price && expense.quantity && " × "}
                      {expense.quantity && `${expense.quantity} units`}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    Paid to: {expense.paidTo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">
                    ₹{expense.amount.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getPaymentMethodLabel(expense.paymentMethod)}
                  </p>
                </div>
              </div>

              {expense.notes && (
                <p className="text-sm text-gray-500 mt-2 italic">
                  {expense.notes}
                </p>
              )}

              <div className="flex gap-2 mt-3 pt-3 border-t">
                <button
                  onClick={() => router.push(`/expenses/${expense._id}/edit`)}
                  className="flex-1 px-3 py-1.5 text-sm text-blue-600 border border-blue-600 rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(expense._id)}
                  className="flex-1 px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
