import axios from "axios";
import { getAccessToken, clearAuthTokens } from "@/lib/auth-token";
import {
  DashboardStats,
  SalesReport,
  ItemSalesData,
  CategorySalesData,
  PaymentMethodData,
  TopSellingItem,
  CustomerAnalytics,
  ReportFilters,
} from "@/types/report";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

// Create axios instance with auth token
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add auth token and outlet ID to requests
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add outlet ID header for multi-tenant data filtering
  const outletId =
    typeof window !== "undefined"
      ? localStorage.getItem("selectedOutletId")
      : null;
  if (outletId) {
    config.headers["x-outlet-id"] = outletId;
  }

  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth tokens
      clearAuthTokens();

      // Only redirect if not already on login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const reportsApi = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get("/reports/dashboard");
    return response.data.data;
  },

  // Get sales report
  getSalesReport: async (filters: ReportFilters): Promise<SalesReport> => {
    const params = new URLSearchParams();
    params.append("startDate", filters.startDate);
    params.append("endDate", filters.endDate);
    if (filters.groupBy) params.append("groupBy", filters.groupBy);

    const response = await api.get(`/reports/sales?${params.toString()}`);
    return response.data.data;
  },

  // Get item sales report
  getItemSalesReport: async (
    filters: ReportFilters
  ): Promise<ItemSalesData[]> => {
    const params = new URLSearchParams();
    params.append("startDate", filters.startDate);
    params.append("endDate", filters.endDate);
    if (filters.categoryId) params.append("categoryId", filters.categoryId);

    const response = await api.get(`/reports/items?${params.toString()}`);
    return response.data.data;
  },

  // Get category sales report
  getCategorySalesReport: async (
    filters: ReportFilters
  ): Promise<CategorySalesData[]> => {
    const params = new URLSearchParams();
    params.append("startDate", filters.startDate);
    params.append("endDate", filters.endDate);

    const response = await api.get(`/reports/categories?${params.toString()}`);
    return response.data.data;
  },

  // Get payment method report
  getPaymentMethodReport: async (
    filters: ReportFilters
  ): Promise<PaymentMethodData[]> => {
    const params = new URLSearchParams();
    params.append("startDate", filters.startDate);
    params.append("endDate", filters.endDate);

    const response = await api.get(
      `/reports/payment-methods?${params.toString()}`
    );
    return response.data.data;
  },

  // Get top selling items
  getTopSellingItems: async (
    filters: ReportFilters
  ): Promise<TopSellingItem[]> => {
    const params = new URLSearchParams();
    params.append("startDate", filters.startDate);
    params.append("endDate", filters.endDate);
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await api.get(`/reports/top-items?${params.toString()}`);
    return response.data.data;
  },

  // Get customer analytics
  getCustomerAnalytics: async (
    filters?: Partial<ReportFilters>
  ): Promise<CustomerAnalytics> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(`/reports/customers?${params.toString()}`);
    return response.data.data;
  },
};
