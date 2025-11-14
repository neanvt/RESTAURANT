"use client";

import Image from "next/image";
import { Item } from "@/types/item";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getFullImageUrl } from "@/lib/imageUtils";

interface ItemCardProps {
  item: Item;
  onAdd?: (item: Item, quantity: number) => void;
  showQuantityControls?: boolean;
  initialQuantity?: number;
}

export function ItemCard({
  item,
  onAdd,
  showQuantityControls = false,
  initialQuantity = 0,
}: ItemCardProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleAdd = () => {
    if (showQuantityControls) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onAdd?.(item, newQuantity);
    } else {
      onAdd?.(item, 1);
    }
  };

  const handleRemove = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onAdd?.(item, newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-xl transition-all hover:shadow-md",
        !item.isAvailable && "opacity-50"
      )}
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {item.image?.url && getFullImageUrl(item.image.url) ? (
          <Image
            src={getFullImageUrl(item.image.url)!}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute right-2 top-2">
          <Badge className="bg-black/70 text-white">
            {formatPrice(item.price)}
          </Badge>
        </div>

        {/* Favourite Badge */}
        {item.isFavourite && (
          <div className="absolute left-2 top-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          </div>
        )}

        {/* Availability Badge */}
        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge variant="destructive">Out of Stock</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="truncate font-medium text-gray-900">{item.name}</h3>

        {item.category && (
          <p className="mt-1 truncate text-xs text-gray-500">
            {typeof item.category === "string"
              ? item.category
              : item.category.name}
          </p>
        )}

        {/* Quantity Controls or Add Button */}
        {showQuantityControls && quantity > 0 ? (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-blue-600 px-2 py-1.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemove}
              disabled={!item.isAvailable}
              className="h-8 w-8 p-0 text-white hover:bg-blue-700 hover:text-white"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-white">{quantity}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAdd}
              disabled={!item.isAvailable}
              className="h-8 w-8 p-0 text-white hover:bg-blue-700 hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!item.isAvailable}
            className="mt-3 w-full rounded-lg bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        )}
      </div>
    </Card>
  );
}
