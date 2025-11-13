import { create } from "zustand";
import {
  Customer,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  CustomerFilters,
  CustomerStats,
  CustomerDetail,
} from "@/types/customer";
import { customersApi } from "@/lib/api/customers";

interface CustomerState {
  customers: Customer[];
  currentCustomer: CustomerDetail | null;
  stats: CustomerStats | null;
  isLoading: boolean;
  error: string | null;
  filters: CustomerFilters;
  pagination: {
    page: number;
    pages: number;
    total: number;
  };

  // Actions
  fetchCustomers: (filters?: CustomerFilters, page?: number) => Promise<void>;
  getCustomerById: (id: string) => Promise<CustomerDetail>;
  createCustomer: (data: CreateCustomerDTO) => Promise<Customer>;
  updateCustomer: (id: string, data: UpdateCustomerDTO) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  searchByPhone: (phone: string) => Promise<Customer[]>;
  fetchStats: (startDate?: string, endDate?: string) => Promise<void>;
  setFilters: (filters: CustomerFilters) => void;
  setCurrentCustomer: (customer: CustomerDetail | null) => void;
  clearError: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  currentCustomer: null,
  stats: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
  },

  fetchCustomers: async (filters, page = 1) => {
    set({ isLoading: true, error: null });
    if (filters) {
      set({ filters });
    }
    try {
      const response = await customersApi.getAll(
        filters || get().filters,
        page
      );
      set({
        customers: response.customers,
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
          error.response?.data?.error?.message || "Failed to fetch customers",
        isLoading: false,
      });
    }
  },

  getCustomerById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const customer = await customersApi.getById(id);
      set({ currentCustomer: customer, isLoading: false });
      return customer;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to fetch customer",
        isLoading: false,
      });
      throw error;
    }
  },

  createCustomer: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newCustomer = await customersApi.create(data);
      set((state) => ({
        customers: [newCustomer, ...state.customers],
        isLoading: false,
      }));
      return newCustomer;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to create customer",
        isLoading: false,
      });
      throw error;
    }
  },

  updateCustomer: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedCustomer = await customersApi.update(id, data);
      set((state) => ({
        customers: state.customers.map((customer) =>
          customer._id === id ? updatedCustomer : customer
        ),
        isLoading: false,
      }));
      return updatedCustomer;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to update customer",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await customersApi.delete(id);
      set((state) => ({
        customers: state.customers.filter((customer) => customer._id !== id),
        currentCustomer:
          state.currentCustomer?._id === id ? null : state.currentCustomer,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to delete customer",
        isLoading: false,
      });
      throw error;
    }
  },

  searchByPhone: async (phone) => {
    try {
      const customers = await customersApi.searchByPhone(phone);
      return customers;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to search customers",
      });
      throw error;
    }
  },

  fetchStats: async (startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      const stats = await customersApi.getStats(startDate, endDate);
      set({ stats, isLoading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error?.message || "Failed to fetch statistics",
        isLoading: false,
      });
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchCustomers(filters);
  },

  setCurrentCustomer: (customer) => {
    set({ currentCustomer: customer });
  },

  clearError: () => {
    set({ error: null });
  },
}));
