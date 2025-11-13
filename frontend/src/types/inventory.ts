export type InventoryUnit =
  | "kg"
  | "litre"
  | "piece"
  | "packet"
  | "gram"
  | "ml"
  | "dozen"
  | "box"
  | "bottle";

export interface RestockHistory {
  date: Date | string;
  quantity: number;
  cost: number;
  restockedBy: {
    _id: string;
    name: string;
    phone: string;
  };
  notes?: string;
}

export interface InventoryItem {
  _id: string;
  outlet: string;
  name: string;
  unit: InventoryUnit;
  currentStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  unitCost?: number;
  supplier?: string;
  category?: string;
  lowStockAlert: boolean;
  lastRestocked?: Date | string;
  restockHistory: RestockHistory[];
  createdBy: {
    _id: string;
    name: string;
    phone: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateInventoryInput {
  name: string;
  unit: InventoryUnit;
  currentStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  unitCost?: number;
  supplier?: string;
  category?: string;
}

export interface UpdateInventoryInput {
  name?: string;
  unit?: InventoryUnit;
  currentStock?: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  unitCost?: number;
  supplier?: string;
  category?: string;
}

export interface RestockInput {
  quantity: number;
  cost: number;
  notes?: string;
}

export interface UseStockInput {
  quantity: number;
  reason?: string;
}

export interface InventoryFilters {
  category?: string;
  lowStock?: boolean;
  search?: string;
}

export interface InventoryValueSummary {
  totalValue: number;
  totalItems: number;
  lowStockCount: number;
  lowStockPercentage: number;
}

export interface StockMovementReport {
  itemId: string;
  itemName: string;
  unit: InventoryUnit;
  currentStock: number;
  reorderLevel: number;
  lowStockAlert: boolean;
  totalRestocked: number;
  totalCost: number;
  restockCount: number;
}

export interface BulkUpdateStock {
  itemId: string;
  newStock: number;
  notes?: string;
}

export const INVENTORY_UNITS: { value: InventoryUnit; label: string }[] = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "gram", label: "Gram (g)" },
  { value: "litre", label: "Litre (L)" },
  { value: "ml", label: "Millilitre (ml)" },
  { value: "piece", label: "Piece" },
  { value: "packet", label: "Packet" },
  { value: "dozen", label: "Dozen" },
  { value: "box", label: "Box" },
  { value: "bottle", label: "Bottle" },
];
