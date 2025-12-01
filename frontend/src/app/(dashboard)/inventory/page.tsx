"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import {
  getInventoryItems,
  deleteInventoryItem,
  getInventoryValueSummary,
} from "@/lib/api/inventory";
import type {
  InventoryItem,
  InventoryFilters,
  InventoryValueSummary,
} from "@/types/inventory";

export default function InventoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventoryValueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InventoryFilters>({});

  useEffect(() => {
    loadInventory();
    loadSummary();
  }, [filters]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await getInventoryItems(filters);
      setItems(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await getInventoryValueSummary();
      setSummary(data);
    } catch (error: any) {
      console.error("Failed to load summary:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      await deleteInventoryItem(id);
      toast.success("Item deleted successfully");
      loadInventory();
      loadSummary();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete item");
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-700" };
    }
    if (item.currentStock <= item.reorderLevel) {
      return { label: "Low Stock", color: "bg-orange-100 text-orange-700" };
    }
    return { label: "In Stock", color: "bg-green-100 text-green-700" };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <h1 className="text-xl font-bold">Inventory</h1>
            </div>
            <button
              onClick={() => router.push("/inventory/create")}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg"
            >
              + Add Item
            </button>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Items</p>
                <p className="text-lg font-bold text-blue-600">
                  {summary.totalItems}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Total Value</p>
                <p className="text-lg font-bold text-purple-600">
                  ₹{summary.totalValue.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Low Stock</p>
                <p className="text-lg font-bold text-orange-600">
                  {summary.lowStockCount}
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() =>
                setFilters({ ...filters, lowStock: !filters.lowStock })
              }
              className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap ${
                filters.lowStock
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Low Stock Only
            </button>
            <input
              type="text"
              placeholder="Search items..."
              value={filters.search || ""}
              onChange={(e) =>
                // Only filter when search has 3+ characters
                setFilters({
                  ...filters,
                  search:
                    e.target.value.length >= 3 ? e.target.value : undefined,
                })
              }
              className="flex-1 px-3 py-1.5 text-sm border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No inventory items found. Add your first item!
          </div>
        ) : (
          items.map((item) => {
            const status = getStockStatus(item);
            return (
              <div
                key={item._id}
                className="bg-white rounded-lg p-4 border shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${status.color}`}
                      >
                        {status.label}
                      </span>
                      {item.category && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    {item.supplier && (
                      <p className="text-sm text-gray-600 mt-1">
                        Supplier: {item.supplier}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {item.currentStock}
                    </p>
                    <p className="text-xs text-gray-500">{item.unit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Reorder Level</p>
                    <p className="font-medium">
                      {item.reorderLevel} {item.unit}
                    </p>
                  </div>
                  {item.unitCost && (
                    <div>
                      <p className="text-gray-500">Unit Cost</p>
                      <p className="font-medium">
                        ₹{item.unitCost.toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() =>
                      router.push(`/inventory/${item._id}/restock`)
                    }
                    className="flex-1 px-3 py-1.5 text-sm text-white bg-green-600 rounded-lg"
                  >
                    Restock
                  </button>
                  <button
                    onClick={() => router.push(`/inventory/${item._id}/edit`)}
                    className="flex-1 px-3 py-1.5 text-sm text-blue-600 border border-blue-600 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
