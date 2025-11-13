import { create } from "zustand";
import {
  Order,
  CreateOrderDTO,
  UpdateOrderDTO,
  OrderFilters,
} from "@/types/order";
import { ordersApi } from "@/lib/api/orders";

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  filters: OrderFilters;

  // Actions
  fetchOrders: (filters?: OrderFilters) => Promise<void>;
  getOrderById: (id: string) => Promise<Order>;
  createOrder: (data: CreateOrderDTO) => Promise<Order>;
  updateOrder: (id: string, data: UpdateOrderDTO) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  generateKOT: (id: string) => Promise<{ order: Order; kot: any }>;
  holdOrder: (id: string) => Promise<Order>;
  resumeOrder: (id: string) => Promise<Order>;
  cancelOrder: (id: string) => Promise<Order>;
  setFilters: (filters: OrderFilters) => void;
  setCurrentOrder: (order: Order | null) => void;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchOrders: async (filters) => {
    set({ isLoading: true, error: null });
    if (filters) {
      set({ filters });
    }
    try {
      const orders = await ordersApi.getAll(filters || get().filters);
      set({ orders, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to fetch orders",
        isLoading: false,
      });
    }
  },

  getOrderById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const order = await ordersApi.getById(id);
      set({ currentOrder: order, isLoading: false });
      return order;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to fetch order",
        isLoading: false,
      });
      throw error;
    }
  },

  createOrder: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newOrder = await ordersApi.create(data);
      set((state) => ({
        orders: [newOrder, ...state.orders],
        currentOrder: newOrder,
        isLoading: false,
      }));
      return newOrder;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to create order",
        isLoading: false,
      });
      throw error;
    }
  },

  updateOrder: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedOrder = await ordersApi.update(id, data);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id ? updatedOrder : order
        ),
        currentOrder:
          state.currentOrder?.id === id ? updatedOrder : state.currentOrder,
        isLoading: false,
      }));
      return updatedOrder;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to update order",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteOrder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await ordersApi.delete(id);
      set((state) => ({
        orders: state.orders.filter((order) => order.id !== id),
        currentOrder: state.currentOrder?.id === id ? null : state.currentOrder,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to delete order",
        isLoading: false,
      });
      throw error;
    }
  },

  generateKOT: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await ordersApi.generateKOT(id);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id ? result.order : order
        ),
        currentOrder:
          state.currentOrder?.id === id ? result.order : state.currentOrder,
        isLoading: false,
      }));
      return result;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to generate KOT",
        isLoading: false,
      });
      throw error;
    }
  },

  holdOrder: async (id) => {
    try {
      const updatedOrder = await ordersApi.hold(id);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id ? updatedOrder : order
        ),
        currentOrder:
          state.currentOrder?.id === id ? updatedOrder : state.currentOrder,
      }));
      return updatedOrder;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to hold order",
      });
      throw error;
    }
  },

  resumeOrder: async (id) => {
    try {
      const updatedOrder = await ordersApi.resume(id);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id ? updatedOrder : order
        ),
        currentOrder:
          state.currentOrder?.id === id ? updatedOrder : state.currentOrder,
      }));
      return updatedOrder;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to resume order",
      });
      throw error;
    }
  },

  cancelOrder: async (id) => {
    try {
      const updatedOrder = await ordersApi.cancel(id);
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id ? updatedOrder : order
        ),
        currentOrder:
          state.currentOrder?.id === id ? updatedOrder : state.currentOrder,
      }));
      return updatedOrder;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || "Failed to cancel order",
      });
      throw error;
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchOrders(filters);
  },

  setCurrentOrder: (order) => {
    set({ currentOrder: order });
  },

  clearError: () => {
    set({ error: null });
  },
}));
