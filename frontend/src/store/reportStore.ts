import { create } from "zustand";
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
import { reportsApi } from "@/lib/api/reports";

interface ReportState {
  dashboardStats: DashboardStats | null;
  salesReport: SalesReport | null;
  itemSales: ItemSalesData[];
  categorySales: CategorySalesData[];
  paymentMethods: PaymentMethodData[];
  topItems: TopSellingItem[];
  customerAnalytics: CustomerAnalytics | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardStats: () => Promise<void>;
  fetchSalesReport: (filters: ReportFilters) => Promise<void>;
  fetchItemSalesReport: (filters: ReportFilters) => Promise<void>;
  fetchCategorySalesReport: (filters: ReportFilters) => Promise<void>;
  fetchPaymentMethodReport: (filters: ReportFilters) => Promise<void>;
  fetchTopSellingItems: (filters: ReportFilters) => Promise<void>;
  fetchCustomerAnalytics: (filters?: Partial<ReportFilters>) => Promise<void>;
  clearError: () => void;
}

export const useReportStore = create<ReportState>((set) => ({
  dashboardStats: null,
  salesReport: null,
  itemSales: [],
  categorySales: [],
  paymentMethods: [],
  topItems: [],
  customerAnalytics: null,
  isLoading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await reportsApi.getDashboardStats();
      set({ dashboardStats: stats, isLoading: false });
    } catch (error: any) {
      // If the request was intentionally skipped because there was no auth/outlet context,
      // don't surface a user-facing error — just stop loading silently.
      if (
        error?.code === "SKIP_REPORTS_NO_CONTEXT" ||
        error?.message === "SKIP_REPORTS_NO_CONTEXT" ||
        error?.code === "SKIP_INVALID_OUTLET" ||
        error?.message === "SKIP_INVALID_OUTLET"
      ) {
        set({ isLoading: false });
        return;
      }
      set({
        error:
          error.response?.data?.error?.message ||
          "Failed to fetch dashboard stats",
        isLoading: false,
      });
    }
  },

  fetchSalesReport: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const report = await reportsApi.getSalesReport(filters);
      set({ salesReport: report, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message ||
          "Failed to fetch sales report",
        isLoading: false,
      });
    }
  },

  fetchItemSalesReport: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const items = await reportsApi.getItemSalesReport(filters);
      set({ itemSales: items, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message ||
          "Failed to fetch item sales report",
        isLoading: false,
      });
    }
  },

  fetchCategorySalesReport: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const categories = await reportsApi.getCategorySalesReport(filters);
      set({ categorySales: categories, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message ||
          "Failed to fetch category sales report",
        isLoading: false,
      });
    }
  },

  fetchPaymentMethodReport: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const methods = await reportsApi.getPaymentMethodReport(filters);
      set({ paymentMethods: methods, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message ||
          "Failed to fetch payment method report",
        isLoading: false,
      });
    }
  },

  fetchTopSellingItems: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const items = await reportsApi.getTopSellingItems(filters);
      set({ topItems: items, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message ||
          "Failed to fetch top selling items",
        isLoading: false,
      });
    }
  },

  fetchCustomerAnalytics: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await reportsApi.getCustomerAnalytics(filters);
      set({ customerAnalytics: analytics, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message ||
          "Failed to fetch customer analytics",
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
