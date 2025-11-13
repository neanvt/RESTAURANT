export interface KOTItem {
  item: string;
  name: string;
  quantity: number;
  notes?: string;
  status: "pending" | "preparing" | "ready";
}

export interface KOT {
  id: string;
  outletId: string;
  orderId: string;
  kotNumber: string;
  items: KOTItem[];
  status: "pending" | "in_progress" | "completed";
  tableNumber?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface KOTFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}
