import axios from "axios";
import { getAccessToken } from "@/lib/auth-token";
import {
  Order,
  CreateOrderDTO,
  UpdateOrderDTO,
  OrderFilters,
} from "@/types/order";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

// Create axios instance with auth token
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ordersApi = {
  // Get all orders with optional filters
  getAll: async (filters?: OrderFilters): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.paymentStatus)
      params.append("paymentStatus", filters.paymentStatus);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(`/orders?${params.toString()}`);
    return response.data.data;
  },

  // Get order by ID
  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  // Create new order
  create: async (data: CreateOrderDTO): Promise<Order> => {
    const response = await api.post("/orders", data);
    return response.data.data;
  },

  // Update order
  update: async (id: string, data: UpdateOrderDTO): Promise<Order> => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data.data;
  },

  // Delete order
  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  // Generate KOT for order
  generateKOT: async (id: string): Promise<{ order: Order; kot: any }> => {
    const response = await api.post(`/orders/${id}/generate-kot`);
    return response.data.data;
  },

  // Hold order
  hold: async (id: string): Promise<Order> => {
    const response = await api.put(`/orders/${id}/hold`);
    return response.data.data;
  },

  // Resume order
  resume: async (id: string): Promise<Order> => {
    const response = await api.put(`/orders/${id}/resume`);
    return response.data.data;
  },

  // Cancel order
  cancel: async (id: string): Promise<Order> => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data.data;
  },

  // Complete order
  complete: async (id: string, paymentMethod?: string): Promise<Order> => {
    const response = await api.put(`/orders/${id}/complete`, { paymentMethod });
    return response.data.data;
  },
};
