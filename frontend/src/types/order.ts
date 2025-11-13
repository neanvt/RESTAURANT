export interface OrderItem {
  item: string;
  name: string;
  price: number;
  quantity: number;
  tax?: {
    rate: number;
    amount: number;
  };
  subtotal: number;
  total: number;
  notes?: string;
}

export interface OrderCustomer {
  name?: string;
  phone?: string;
  address?: string;
}

export interface Order {
  id: string;
  outletId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: "draft" | "kot_generated" | "on_hold" | "completed" | "cancelled";
  paymentStatus: "pending" | "partial" | "paid";
  paymentMethod?: "cash" | "upi" | "card" | "phonepe" | "googlepay";
  customer?: OrderCustomer;
  tableNumber?: string;
  kotId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateOrderDTO {
  items: {
    item: string;
    quantity: number;
    notes?: string;
  }[];
  customer?: OrderCustomer;
  tableNumber?: string;
  notes?: string;
}

export interface UpdateOrderDTO extends Partial<CreateOrderDTO> {}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}
