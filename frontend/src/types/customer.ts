export interface Customer {
  _id: string;
  outlet: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  anniversary?: string;
  tags?: string[];
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDTO {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  anniversary?: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateCustomerDTO {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  anniversary?: string;
  tags?: string[];
  notes?: string;
  isActive?: boolean;
}

export interface CustomerFilters {
  search?: string;
  tags?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersToday: number;
  topCustomers: Array<{
    _id: string;
    name: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
  }>;
}

export interface CustomerDetail extends Customer {
  statistics: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
  };
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
}

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  pages: number;
}
