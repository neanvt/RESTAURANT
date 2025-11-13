import axios from "axios";
import { getAccessToken } from "@/lib/auth-token";
import {
  Customer,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  CustomerFilters,
  CustomerStats,
  CustomerDetail,
  CustomerListResponse,
} from "@/types/customer";

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

export const customersApi = {
  // Get all customers with optional filters
  getAll: async (
    filters?: CustomerFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<CustomerListResponse> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.tags) params.append("tags", filters.tags);
    if (filters?.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await api.get(`/customers?${params.toString()}`);
    return response.data.data;
  },

  // Get customer by ID with statistics
  getById: async (id: string): Promise<CustomerDetail> => {
    const response = await api.get(`/customers/${id}`);
    return response.data.data;
  },

  // Create new customer
  create: async (data: CreateCustomerDTO): Promise<Customer> => {
    const response = await api.post("/customers", data);
    return response.data.data;
  },

  // Update customer
  update: async (id: string, data: UpdateCustomerDTO): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data.data;
  },

  // Delete customer
  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  // Search customers by phone
  searchByPhone: async (phone: string): Promise<Customer[]> => {
    const response = await api.get(`/customers/search?phone=${phone}`);
    return response.data.data;
  },

  // Get customer statistics
  getStats: async (
    startDate?: string,
    endDate?: string
  ): Promise<CustomerStats> => {
    const params = new URLSearchParams();

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/customers/stats?${params.toString()}`);
    return response.data.data;
  },
};
