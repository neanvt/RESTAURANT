import axios from "axios";
import { getAccessToken } from "@/lib/auth-token";
import {
  Invoice,
  CreateInvoiceDTO,
  UpdatePaymentStatusDTO,
  InvoiceFilters,
  SalesSummary,
  InvoiceListResponse,
} from "@/types/invoice";

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

export const invoiceAPI = {
  // Create invoice from order
  createInvoice: async (data: CreateInvoiceDTO): Promise<Invoice> => {
    const response = await api.post("/invoices", data);
    return response.data.data;
  },

  // Get all invoices with filters
  getInvoices: async (
    filters?: InvoiceFilters,
    page: number = 1,
    limit: number = 1000
  ): Promise<InvoiceListResponse> => {
    const params = new URLSearchParams();

    if (filters?.paymentStatus)
      params.append("paymentStatus", filters.paymentStatus);
    if (filters?.paymentMethod)
      params.append("paymentMethod", filters.paymentMethod);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.customerName)
      params.append("customerName", filters.customerName);
    if (filters?.search) params.append("search", filters.search);

    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await api.get(`/invoices?${params.toString()}`);
    return response.data.data;
  },

  // Get single invoice by ID (includes QR code)
  getInvoice: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data.data;
  },

  // Update payment status
  updatePaymentStatus: async (
    id: string,
    data: UpdatePaymentStatusDTO
  ): Promise<Invoice> => {
    const response = await api.put(`/invoices/${id}/payment`, data);
    return response.data.data;
  },

  // Get invoice by order ID
  getInvoiceByOrder: async (orderId: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/order/${orderId}`);
    return response.data.data;
  },

  // Get sales summary
  getSalesSummary: async (
    startDate?: string,
    endDate?: string
  ): Promise<SalesSummary> => {
    const params = new URLSearchParams();

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/invoices/summary?${params.toString()}`);
    return response.data.data;
  },

  // Print invoice (triggers browser print dialog)
  printInvoice: (invoice: Invoice): void => {
    window.print();
  },

  // Download invoice as PDF (implementation would use library like jsPDF)
  downloadInvoicePDF: async (invoice: Invoice): Promise<void> => {
    // This would be implemented with a PDF library
    // For now, we'll use browser print to PDF
    window.print();
  },
};
