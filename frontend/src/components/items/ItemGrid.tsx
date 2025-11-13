"use client";

import { Item } from "@/types/item";
import { ItemCard } from "./ItemCard";

interface ItemGridProps {
  items: Item[];
  onItemAdd?: (item: Item, quantity: number) => void;
  showQuantityControls?: boolean;
  isLoading?: boolean;
}

export function ItemGrid({
  items,
  onItemAdd,
  showQuantityControls = false,
  isLoading = false,
}: ItemGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-xl bg-gray-200"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-lg font-semibold text-gray-900">No items found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Add your first menu item to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onAdd={onItemAdd}
          showQuantityControls={showQuantityControls}
        />
      ))}
    </div>
  );
}
