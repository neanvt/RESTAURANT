"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit, Trash2, Star, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryFilter } from "@/components/items/CategoryFilter";
import { useCategoryStore } from "@/store/categoryStore";
import { useItemStore } from "@/store/itemStore";
import { Item } from "@/types/item";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function ItemsPage() {
  const router = useRouter();
  const { fetchCategories } = useCategoryStore();
  const {
    items,
    filters,
    isLoading,
    fetchItems,
    deleteItem,
    toggleFavourite,
    toggleAvailability,
    setFilters,
  } = useItemStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [fetchCategories, fetchItems]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters({ ...filters, search: value || undefined });
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setFilters({ ...filters, category: categoryId || undefined });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteItem(id);
        toast.success("Item deleted successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete item");
      }
    }
  };

  const handleToggleFavourite = async (id: string) => {
    try {
      await toggleFavourite(id);
    } catch (error: any) {
      toast.error(error.message || "Failed to update item");
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      await toggleAvailability(id);
    } catch (error: any) {
      toast.error(error.message || "Failed to update item");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Items</h1>
            <Button
              onClick={() => router.push("/items/create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 pb-3">
          <CategoryFilter
            selectedCategory={filters.category || null}
            onCategorySelect={handleCategorySelect}
          />
        </div>
      </div>

      {/* Items List */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold text-gray-900">
              No items found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Add your first menu item to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 p-3">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      {item.image?.url ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}${item.image.url}`}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <span className="text-2xl">🍽️</span>
                        </div>
                      )}
                      {/* Favourite Badge */}
                      {item.isFavourite && (
                        <div className="absolute top-1 right-1 bg-yellow-400 rounded-full p-1">
                          <Star className="h-3 w-3 text-white fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold text-blue-600">
                          ₹{item.price.toFixed(2)}
                        </span>
                        {!item.isAvailable && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/items/${item.id}/edit`)}
                      className="flex-shrink-0"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex gap-2 px-3 pb-3 border-t pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleFavourite(item.id)}
                      className={cn(
                        "flex-1",
                        item.isFavourite && "text-yellow-600 border-yellow-600"
                      )}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4",
                          item.isFavourite && "fill-current"
                        )}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAvailability(item.id)}
                      className={cn(
                        "flex-1",
                        !item.isAvailable && "text-red-600 border-red-600"
                      )}
                    >
                      {item.isAvailable ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
