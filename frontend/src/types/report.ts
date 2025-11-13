export interface DashboardStats {
  today: {
    orders: number;
    revenue: number;
    invoices: number;
  };
  yesterday: {
    orders: number;
    revenue: number;
  };
  monthToDate: {
    revenue: number;
  };
}

export interface SalesData {
  _id: {
    year: number;
    month: number;
    day?: number;
    hour?: number;
    week?: number;
  };
  totalOrders: number;
  totalRevenue: number;
  totalTax: number;
  averageOrderValue: number;
}

export interface SalesReport {
  salesData: SalesData[];
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalTax: number;
    averageOrderValue: number;
  };
}

export interface ItemSalesData {
  _id: string;
  itemName: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface CategorySalesData {
  _id: string;
  categoryName: string;
  quantitySold: number;
  totalRevenue: number;
  uniqueItems: number;
}

export interface PaymentMethodData {
  _id: string;
  count: number;
  totalAmount: number;
  averageAmount: number;
}

export interface TopSellingItem {
  _id: string;
  itemName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  topCustomers: Array<{
    _id: string;
    name: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
  }>;
  customerGrowth: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
  }>;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  groupBy?: "hour" | "day" | "week" | "month";
  categoryId?: string;
  limit?: number;
}
