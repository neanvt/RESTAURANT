"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategoryStore } from "@/store/categoryStore";
import type { Category } from "@/types/category";

interface CategorySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (categoryId: string) => void;
  selectedCategory?: string;
}

export function CategorySelector({
  isOpen,
  onClose,
  onSelect,
  selectedCategory,
}: CategorySelectorProps) {
  const router = useRouter();
  const { categories, isLoading, fetchCategories } = useCategoryStore();

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

  const handleSelect = (categoryId: string) => {
    onSelect(categoryId);
    onClose();
  };

  const handleAddCategory = () => {
    onClose();
    router.push("/categories");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-t-2xl rounded-t-2xl max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Select Item Category
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <p className="text-gray-600 mb-4">No categories available</p>
              <Button
                onClick={handleAddCategory}
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                Add Your First Category
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* None Option */}
              <button
                onClick={() => handleSelect("")}
                className={`w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors ${
                  !selectedCategory || selectedCategory === ""
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-900"
                }`}
              >
                None
              </button>

              {/* Category Options */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleSelect(category.id)}
                  className={`w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedCategory === category.id
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-900"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add Category Button */}
        <div className="border-t border-gray-200 p-4 pb-20">
          <Button
            onClick={handleAddCategory}
            variant="outline"
            className="w-full h-12 text-base border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            Add Item Category
          </Button>
        </div>
      </div>
    </div>
  );
}
