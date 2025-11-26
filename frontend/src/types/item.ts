import { Category } from "./category";

export interface ItemImage {
  url?: string;
  isAiGenerated: boolean;
  aiPrompt?: string;
}

export interface ItemTax {
  isApplicable: boolean;
  rate: number;
  type: "percentage" | "fixed";
}

export interface ItemInventory {
  trackInventory: boolean;
  currentStock: number;
  lowStockAlert: number;
}

export interface Item {
  id: string;
  outletId: string;
  name: string;
  description?: string;
  category: string | Category;
  price: number;
  image: ItemImage;
  tax: ItemTax;
  isFavourite: boolean;
  isAvailable: boolean;
  isActive: boolean;
  inventory: ItemInventory;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemDTO {
  name: string;
  description?: string;
  category: string;
  price: number;
  image?: Partial<ItemImage>;
  tax?: Partial<ItemTax>;
  isFavourite?: boolean;
  isAvailable?: boolean;
  inventory?: Partial<ItemInventory>;
}

export interface UpdateItemDTO extends Partial<CreateItemDTO> {}

export interface ItemFilters {
  outletId?: string;
  category?: string;
  isFavourite?: boolean;
  isAvailable?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface GenerateImageDTO {
  prompt?: string;
  async?: boolean;
}

export interface UpdateStockDTO {
  quantity: number;
  operation: "add" | "subtract" | "set";
}
