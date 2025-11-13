"use client";

import { useEffect } from "react";
import { useCategoryStore } from "@/store/categoryStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  onFavouriteSelect?: () => void;
  showFavourite?: boolean;
}

export function CategoryFilter({
  selectedCategory,
  onCategorySelect,
  onFavouriteSelect,
  showFavourite = false,
}: CategoryFilterProps) {
  const { categories, fetchCategories, isLoading } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (isLoading) {
    return (
      <div
        className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-24 animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <Button
        variant={
          selectedCategory === null && !showFavourite ? "default" : "outline"
        }
        size="sm"
        onClick={() => onCategorySelect(null)}
        className={cn(
          "flex-shrink-0 rounded-lg px-4",
          selectedCategory === null &&
            !showFavourite &&
            "bg-blue-600 text-white hover:bg-blue-700"
        )}
      >
        ALL
      </Button>

      <Button
        variant={showFavourite ? "default" : "outline"}
        size="sm"
        onClick={onFavouriteSelect}
        className={cn(
          "flex-shrink-0 rounded-lg px-4 gap-1",
          showFavourite && "bg-blue-600 text-white hover:bg-blue-700"
        )}
      >
        <Star className="h-3 w-3" />
        Fav
      </Button>

      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          size="sm"
          onClick={() => onCategorySelect(category.id)}
          className={cn(
            "flex-shrink-0 rounded-lg px-4",
            selectedCategory === category.id &&
              "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
