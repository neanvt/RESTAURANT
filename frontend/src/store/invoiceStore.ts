import { create } from "zustand";
import {
  Invoice,
  CreateInvoiceDTO,
  UpdatePaymentStatusDTO,
  InvoiceFilters,
  SalesSummary,
} from "@/types/invoice";
import { invoiceAPI } from "@/lib/api/invoices";

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  salesSummary: SalesSummary | null;
  isLoading: boolean;
  error: string | null;
  filters: InvoiceFilters;
  pagination: {
    page: number;
    pages: number;
    total: number;
  };

  // Actions
  fetchInvoices: (filters?: InvoiceFilters, page?: number) => Promise<void>;
  getInvoiceById: (id: string) => Promise<Invoice>;
  getInvoiceByOrder: (orderId: string) => Promise<Invoice>;
  createInvoice: (data: CreateInvoiceDTO) => Promise<Invoice>;
  updatePaymentStatus: (
    id: string,
    data: UpdatePaymentStatusDTO
  ) => Promise<Invoice>;
  fetchSalesSummary: (startDate?: string, endDate?: string) => Promise<void>;
  setFilters: (filters: InvoiceFilters) => void;
  setCurrentInvoice: (invoice: Invoice | null) => void;
  clearError: () => void;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  currentInvoice: null,
  salesSummary: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
  },

  fetchInvoices: async (filters, page = 1) => {
    set({ isLoading: true, error: null });
    if (filters) {
      set({ filters });
    }
    try {
      const response = await invoiceAPI.getInvoices(
        filters || get().filters,
        page
      );
      set({
        invoices: response.invoices,
        pagination: {
          page: response.page,
          pages: response.pages,
          total: response.total,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to fetch invoices",
        isLoading: false,
      });
    }
  },

  getInvoiceById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const invoice = await invoiceAPI.getInvoice(id);
      set({ currentInvoice: invoice, isLoading: false });
      return invoice;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to fetch invoice",
        isLoading: false,
      });
      throw error;
    }
  },

  getInvoiceByOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const invoice = await invoiceAPI.getInvoiceByOrder(orderId);
      set({ currentInvoice: invoice, isLoading: false });
      return invoice;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to fetch invoice",
        isLoading: false,
      });
      throw error;
    }
  },

  createInvoice: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newInvoice = await invoiceAPI.createInvoice(data);
      set((state) => ({
        invoices: [newInvoice, ...state.invoices],
        currentInvoice: newInvoice,
        isLoading: false,
      }));
      return newInvoice;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to create invoice",
        isLoading: false,
      });
      throw error;
    }
  },

  updatePaymentStatus: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedInvoice = await invoiceAPI.updatePaymentStatus(id, data);
      set((state) => ({
        invoices: state.invoices.map((invoice) =>
          invoice._id === id ? updatedInvoice : invoice
        ),
        currentInvoice:
          state.currentInvoice?._id === id
            ? updatedInvoice
            : state.currentInvoice,
        isLoading: false,
      }));
      return updatedInvoice;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message ||
          "Failed to update payment status",
        isLoading: false,
      });
      throw error;
    }
  },

  fetchSalesSummary: async (startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      const summary = await invoiceAPI.getSalesSummary(startDate, endDate);
      set({ salesSummary: summary, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message ||
          "Failed to fetch sales summary",
        isLoading: false,
      });
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchInvoices(filters);
  },

  setCurrentInvoice: (invoice) => {
    set({ currentInvoice: invoice });
  },

  clearError: () => {
    set({ error: null });
  },
}));
