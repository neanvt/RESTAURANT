"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  getInventoryItemById,
  restockItem,
  getRestockHistory,
} from "@/lib/api/inventory";
import type { InventoryItem, RestockHistory } from "@/types/inventory";

export default function RestockPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [history, setHistory] = useState<RestockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 0,
    cost: 0,
    notes: "",
  });

  useEffect(() => {
    loadItem();
    loadHistory();
  }, [itemId]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const data = await getInventoryItemById(itemId);
      setItem(data);
      // Set default quantity to reorder quantity
      setFormData((prev) => ({ ...prev, quantity: data.reorderQuantity }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load item");
      router.push("/inventory");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await getRestockHistory(itemId, 10);
      setHistory(data);
    } catch (error: any) {
      console.error("Failed to load history:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (formData.cost < 0) {
      toast.error("Cost cannot be negative");
      return;
    }

    try {
      setSubmitting(true);
      await restockItem(itemId, formData);
      toast.success("Item restocked successfully");
      router.push("/inventory");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to restock item");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const newStock = item ? item.currentStock + formData.quantity : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return null;
  }

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
            <div>
              <h1 className="text-xl font-bold">Restock Item</h1>
              <p className="text-sm text-gray-600">{item.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Stock Info */}
        <div className="bg-white rounded-lg p-4 border">
          <h2 className="font-semibold mb-3">Current Stock</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {item.currentStock} {item.unit}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">After Restock</p>
              <p className="text-2xl font-bold text-green-600">
                {newStock} {item.unit}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t text-sm">
            <p className="text-gray-600">
              Reorder Level: {item.reorderLevel} {item.unit}
            </p>
            <p className="text-gray-600">
              Suggested Quantity: {item.reorderQuantity} {item.unit}
            </p>
          </div>
        </div>

        {/* Restock Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg p-4 border space-y-4"
        >
          <h2 className="font-semibold">Restock Details</h2>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity ({item.unit}) *
            </label>
            <input
              type="number"
              value={formData.quantity || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quantity: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0"
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Cost (₹) *
            </label>
            <input
              type="number"
              value={formData.cost || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            {formData.quantity > 0 && formData.cost > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Unit cost: ₹{(formData.cost / formData.quantity).toFixed(2)}
              </p>
            )}
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
            disabled={submitting}
            className="w-full py-3 bg-green-600 text-white font-medium rounded-lg disabled:opacity-50"
          >
            {submitting ? "Restocking..." : "Confirm Restock"}
          </button>
        </form>

        {/* Restock History */}
        {history.length > 0 && (
          <div className="bg-white rounded-lg p-4 border">
            <h2 className="font-semibold mb-3">Recent Restock History</h2>
            <div className="space-y-3">
              {history.map((entry, index) => (
                <div key={index} className="pb-3 border-b last:border-b-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-medium">
                        +{entry.quantity} {item.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(entry.date)}
                      </p>
                    </div>
                    <p className="font-semibold text-green-600">
                      ₹{entry.cost.toLocaleString("en-IN")}
                    </p>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-600 italic">
                      {entry.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
