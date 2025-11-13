"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInventoryItem } from "@/lib/api/inventory";
import type { CreateInventoryInput } from "@/types/inventory";
import { INVENTORY_UNITS } from "@/types/inventory";

export default function CreateInventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateInventoryInput>({
    name: "",
    unit: "kg",
    currentStock: 0,
    reorderLevel: 10,
    reorderQuantity: 50,
    unitCost: 0,
    supplier: "",
    category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Item name is required");
      return;
    }

    if (formData.currentStock < 0) {
      toast.error("Current stock cannot be negative");
      return;
    }

    if (formData.reorderLevel < 0) {
      toast.error("Reorder level cannot be negative");
      return;
    }

    try {
      setLoading(true);
      await createInventoryItem(formData);
      toast.success("Inventory item created successfully");
      router.push("/inventory");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create inventory item"
      );
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
            <h1 className="text-xl font-bold">Add Inventory Item</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Tomatoes, Oil, Sugar"
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit *
          </label>
          <select
            value={formData.unit}
            onChange={(e) =>
              setFormData({ ...formData, unit: e.target.value as any })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            {INVENTORY_UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>
        </div>

        {/* Current Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Stock *
          </label>
          <input
            type="number"
            value={formData.currentStock || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                currentStock: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        {/* Reorder Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reorder Level *
          </label>
          <input
            type="number"
            value={formData.reorderLevel || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                reorderLevel: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="10"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Alert when stock falls below this level
          </p>
        </div>

        {/* Reorder Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reorder Quantity *
          </label>
          <input
            type="number"
            value={formData.reorderQuantity || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                reorderQuantity: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="50"
            min="0.01"
            step="0.01"
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Suggested quantity to order when restocking
          </p>
        </div>

        {/* Unit Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Cost (₹) (Optional)
          </label>
          <input
            type="number"
            value={formData.unitCost || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                unitCost: parseFloat(e.target.value) || undefined,
              })
            }
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category (Optional)
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            placeholder="e.g., Vegetables, Dairy, Spices"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Supplier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Supplier (Optional)
          </label>
          <input
            type="text"
            value={formData.supplier}
            onChange={(e) =>
              setFormData({ ...formData, supplier: e.target.value })
            }
            placeholder="Supplier name"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-600 text-white font-medium rounded-lg disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Item"}
        </button>
      </form>
    </div>
  );
}
