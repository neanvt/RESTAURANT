"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createExpense,
  getExpenseSuggestions,
  getExpenses,
} from "@/lib/api/expenses";
import type { CreateExpenseInput } from "@/types/expense";
import { PAYMENT_METHODS } from "@/types/expense";
import { getTodayLocal } from "@/lib/date-utils";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";

export default function CreateExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateExpenseInput>({
    category: "" as any,
    amount: 0,
    price: undefined,
    quantity: undefined,
    description: "",
    date: getTodayLocal(),
    paidTo: "",
    paymentMethod: "cash",
    notes: "",
  });

  // Auto-calculate amount when price or quantity changes
  const handlePriceChange = (value: number | undefined) => {
    setFormData((prev) => {
      const newPrice = value;
      const amount =
        newPrice && prev.quantity ? newPrice * prev.quantity : prev.amount;
      return { ...prev, price: newPrice, amount };
    });
  };

  const handleQuantityChange = (value: number | undefined) => {
    setFormData((prev) => {
      const newQuantity = value;
      const amount =
        prev.price && newQuantity ? prev.price * newQuantity : prev.amount;
      return { ...prev, quantity: newQuantity, amount };
    });
  };

  // Load existing categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const expenses = await getExpenses({});
        const categories = [...new Set(expenses.map((e) => e.category))];
        setExistingCategories(categories);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  const fetchCategorySuggestions = async (query: string) => {
    // Combine API suggestions with existing categories
    const apiSuggestions = await getExpenseSuggestions("category", query);
    const filtered = existingCategories.filter((cat) =>
      cat.toLowerCase().includes(query.toLowerCase())
    );
    // Merge and deduplicate
    return [...new Set([...apiSuggestions, ...filtered])];
  };

  const fetchDescriptionSuggestions = async (query: string) => {
    return getExpenseSuggestions("description", query);
  };

  const fetchPaidToSuggestions = async (query: string) => {
    return getExpenseSuggestions("paidTo", query);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    if (formData.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (!formData.paidTo.trim()) {
      toast.error("Paid to is required");
      return;
    }

    try {
      setLoading(true);
      await createExpense(formData);
      toast.success("Expense created successfully");
      router.push("/expenses");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Add Expense</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <AutocompleteInput
            value={formData.category}
            onChange={(value) =>
              setFormData({ ...formData, category: value as any })
            }
            onFetchSuggestions={fetchCategorySuggestions}
            placeholder="e.g., Ingredients, Utilities, Salary"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Type to search or create new category
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <AutocompleteInput
            value={formData.description}
            onChange={(value) =>
              setFormData({ ...formData, description: value })
            }
            onFetchSuggestions={fetchDescriptionSuggestions}
            placeholder="e.g., Vegetables purchase"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Previous descriptions will appear as you type
          </p>
        </div>

        {/* Price and Quantity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              value={formData.price || ""}
              onChange={(e) =>
                handlePriceChange(
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              placeholder="Per unit"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={formData.quantity || ""}
              onChange={(e) =>
                handleQuantityChange(
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              placeholder="Units"
              min="0"
              step="1"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Amount - Auto-calculated or Manual */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Amount (₹) *
          </label>
          <input
            type="number"
            value={formData.amount || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                amount: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border rounded-lg bg-gray-50"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.price && formData.quantity
              ? `Auto-calculated: ${formData.price} × ${
                  formData.quantity
                } = ₹${formData.amount.toFixed(2)}`
              : "Enter manually or use Price × Quantity"}
          </p>
        </div>

        {/* Date and Payment Method */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={
                typeof formData.date === "string"
                  ? formData.date
                  : formData.date.toISOString().split("T")[0]
              }
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentMethod: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Paid To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paid To *
          </label>
          <AutocompleteInput
            value={formData.paidTo}
            onChange={(value) => setFormData({ ...formData, paidTo: value })}
            onFetchSuggestions={fetchPaidToSuggestions}
            placeholder="Vendor/Supplier name"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Previous vendors will appear as you type
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Additional notes..."
            rows={3}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Expense"}
        </button>
      </form>
    </div>
  );
}
