import axios from "axios";
import { getAccessToken } from "@/lib/auth-token";
import type {
  InventoryItem,
  CreateInventoryInput,
  UpdateInventoryInput,
  RestockInput,
  UseStockInput,
  InventoryFilters,
  InventoryValueSummary,
  RestockHistory,
  StockMovementReport,
  BulkUpdateStock,
} from "@/types/inventory";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

const inventoryApi = axios.create({
  baseURL: `${API_URL}/api/inventory`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
inventoryApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Create new inventory item
 */
export const createInventoryItem = async (
  data: CreateInventoryInput
): Promise<InventoryItem> => {
  const response = await inventoryApi.post("/", data);
  return response.data.data;
};

/**
 * Get all inventory items with filters
 */
export const getInventoryItems = async (
  filters?: InventoryFilters
): Promise<InventoryItem[]> => {
  const response = await inventoryApi.get("/", { params: filters });
  return response.data.data;
};

/**
 * Get inventory item by ID
 */
export const getInventoryItemById = async (
  id: string
): Promise<InventoryItem> => {
  const response = await inventoryApi.get(`/${id}`);
  return response.data.data;
};

/**
 * Update inventory item
 */
export const updateInventoryItem = async (
  id: string,
  data: UpdateInventoryInput
): Promise<InventoryItem> => {
  const response = await inventoryApi.put(`/${id}`, data);
  return response.data.data;
};

/**
 * Delete inventory item
 */
export const deleteInventoryItem = async (id: string): Promise<void> => {
  await inventoryApi.delete(`/${id}`);
};

/**
 * Restock inventory item
 */
export const restockItem = async (
  id: string,
  data: RestockInput
): Promise<InventoryItem> => {
  const response = await inventoryApi.post(`/${id}/restock`, data);
  return response.data.data;
};

/**
 * Use/consume stock
 */
export const useStock = async (
  id: string,
  data: UseStockInput
): Promise<InventoryItem> => {
  const response = await inventoryApi.post(`/${id}/use`, data);
  return response.data.data;
};

/**
 * Get low stock items
 */
export const getLowStockItems = async (): Promise<InventoryItem[]> => {
  const response = await inventoryApi.get("/low-stock");
  return response.data.data;
};

/**
 * Get inventory value summary
 */
export const getInventoryValueSummary =
  async (): Promise<InventoryValueSummary> => {
    const response = await inventoryApi.get("/value-summary");
    return response.data.data;
  };

/**
 * Get restock history for item
 */
export const getRestockHistory = async (
  id: string,
  limit: number = 50
): Promise<RestockHistory[]> => {
  const response = await inventoryApi.get(`/${id}/restock-history`, {
    params: { limit },
  });
  return response.data.data;
};

/**
 * Get inventory categories
 */
export const getInventoryCategories = async (): Promise<string[]> => {
  const response = await inventoryApi.get("/categories");
  return response.data.data;
};

/**
 * Get stock movement report
 */
export const getStockMovementReport = async (
  startDate: Date | string,
  endDate: Date | string
): Promise<StockMovementReport[]> => {
  const response = await inventoryApi.get("/stock-movement", {
    params: { startDate, endDate },
  });
  return response.data.data;
};

/**
 * Bulk update stock levels
 */
export const bulkUpdateStock = async (
  updates: BulkUpdateStock[]
): Promise<{
  success: string[];
  failed: { itemId: string; error: string }[];
}> => {
  const response = await inventoryApi.post("/bulk-update", { updates });
  return response.data.data;
};
