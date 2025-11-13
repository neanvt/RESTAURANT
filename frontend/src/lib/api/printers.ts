import axios from "axios";
import { getAccessToken } from "@/lib/auth-token";
import type {
  Printer,
  CreatePrinterInput,
  UpdatePrinterInput,
  PrintJob,
  CreatePrintJobInput,
  PrintJobFilters,
} from "@/types/printer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

const printersApi = axios.create({
  baseURL: `${API_URL}/api/printers`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
printersApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Create new printer
 */
export const createPrinter = async (
  data: CreatePrinterInput
): Promise<Printer> => {
  const response = await printersApi.post("/", data);
  return response.data.data;
};

/**
 * Get all printers
 */
export const getPrinters = async (): Promise<Printer[]> => {
  const response = await printersApi.get("/");
  return response.data.data;
};

/**
 * Get printer by ID
 */
export const getPrinterById = async (id: string): Promise<Printer> => {
  const response = await printersApi.get(`/${id}`);
  return response.data.data;
};

/**
 * Update printer
 */
export const updatePrinter = async (
  id: string,
  data: UpdatePrinterInput
): Promise<Printer> => {
  const response = await printersApi.put(`/${id}`, data);
  return response.data.data;
};

/**
 * Delete printer
 */
export const deletePrinter = async (id: string): Promise<void> => {
  await printersApi.delete(`/${id}`);
};

/**
 * Update printer status
 */
export const updatePrinterStatus = async (
  id: string,
  status: string
): Promise<Printer> => {
  const response = await printersApi.patch(`/${id}/status`, { status });
  return response.data.data;
};

/**
 * Set default printer
 */
export const setDefaultPrinter = async (id: string): Promise<Printer> => {
  const response = await printersApi.patch(`/${id}/set-default`);
  return response.data.data;
};

/**
 * Create print job
 */
export const createPrintJob = async (
  data: CreatePrintJobInput
): Promise<PrintJob> => {
  const response = await printersApi.post("/jobs", data);
  return response.data.data;
};

/**
 * Get print jobs with filters
 */
export const getPrintJobs = async (
  filters?: PrintJobFilters
): Promise<PrintJob[]> => {
  const response = await printersApi.get("/jobs", { params: filters });
  return response.data.data;
};

/**
 * Update print job status
 */
export const updatePrintJobStatus = async (
  id: string,
  status: string,
  error?: string
): Promise<PrintJob> => {
  const response = await printersApi.patch(`/jobs/${id}/status`, {
    status,
    error,
  });
  return response.data.data;
};

/**
 * Retry print job
 */
export const retryPrintJob = async (id: string): Promise<PrintJob> => {
  const response = await printersApi.post(`/jobs/${id}/retry`);
  return response.data.data;
};

/**
 * Cancel print job
 */
export const cancelPrintJob = async (id: string): Promise<PrintJob> => {
  const response = await printersApi.post(`/jobs/${id}/cancel`);
  return response.data.data;
};
