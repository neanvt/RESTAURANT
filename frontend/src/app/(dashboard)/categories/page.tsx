"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import type { Category } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategoryStore } from "@/store/categoryStore";
import { toast } from "sonner";

export default function AddCategoryPage() {
  const router = useRouter();
  const { categories, isLoading, fetchCategories, createCategory } =
    useCategoryStore();

  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSaveAndNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCategory({ name: categoryName.trim() });
      toast.success("Category created successfully!");
      setCategoryName(""); // Clear for new entry
    } catch (error: any) {
      toast.error(error.message || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCategory({ name: categoryName.trim() });
      toast.success("Category created successfully!");
      router.back();
    } catch (error: any) {
      toast.error(error.message || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Add Item Category
            </h1>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-6">
        {/* Category Name Input */}
        <div className="space-y-2">
          <label
            htmlFor="category-name"
            className="block text-sm text-gray-600"
          >
            Category Name
          </label>
          <Input
            id="category-name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder=""
            className="w-full h-12 border-2 border-blue-500 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            autoFocus
          />
          <div className="flex items-start gap-2 text-sm text-gray-500">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Items are shown by category while entering orders</p>
          </div>
        </div>

        {/* All Categories Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            ALL CATEGORIES
          </h2>

          {/* Category List */}
          <div className="space-y-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
            {categories.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                No categories yet. Add your first category above.
              </div>
            ) : (
              categories.map((category, index) => (
                <div
                  key={category.id}
                  className={`px-4 py-4 ${
                    index !== categories.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <p className="text-base text-gray-900">{category.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t p-4 z-10 shadow-lg">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveAndNew}
            disabled={isSubmitting || !categoryName.trim()}
            className="flex-1 h-12 text-base border-gray-300 hover:bg-gray-50"
          >
            Save & New
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || !categoryName.trim()}
            className="flex-1 h-12 text-base bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              "Save Category"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
