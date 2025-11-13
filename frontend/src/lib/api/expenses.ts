import axios from "axios";
import { getAccessToken } from "@/lib/auth-token";
import type {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseFilters,
  ExpenseSummary,
  ExpenseTrend,
} from "@/types/expense";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

const expensesApi = axios.create({
  baseURL: `${API_URL}/api/expenses`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token and outlet ID to requests
expensesApi.interceptors.request.use((config) => {
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

/**
 * Create new expense
 */
export const createExpense = async (
  data: CreateExpenseInput
): Promise<Expense> => {
  const response = await expensesApi.post("/", data);
  return response.data.data;
};

/**
 * Get all expenses with filters
 */
export const getExpenses = async (
  filters?: ExpenseFilters
): Promise<Expense[]> => {
  const response = await expensesApi.get("/", { params: filters });
  return response.data.data;
};

/**
 * Get expense by ID
 */
export const getExpenseById = async (id: string): Promise<Expense> => {
  const response = await expensesApi.get(`/${id}`);
  return response.data.data;
};

/**
 * Update expense
 */
export const updateExpense = async (
  id: string,
  data: UpdateExpenseInput
): Promise<Expense> => {
  const response = await expensesApi.put(`/${id}`, data);
  return response.data.data;
};

/**
 * Delete expense
 */
export const deleteExpense = async (id: string): Promise<void> => {
  await expensesApi.delete(`/${id}`);
};

/**
 * Get expense summary by category
 */
export const getExpenseSummary = async (
  startDate?: Date | string,
  endDate?: Date | string
): Promise<ExpenseSummary> => {
  const response = await expensesApi.get("/summary", {
    params: { startDate, endDate },
  });
  return response.data.data;
};

/**
 * Get expense trends
 */
export const getExpenseTrends = async (
  startDate: Date | string,
  endDate: Date | string,
  groupBy: "day" | "week" | "month" = "day"
): Promise<ExpenseTrend[]> => {
  const response = await expensesApi.get("/trends", {
    params: { startDate, endDate, groupBy },
  });
  return response.data.data;
};

/**
 * Get autocomplete suggestions for expense fields
 */
export const getExpenseSuggestions = async (
  field: "description" | "paidTo" | "category",
  query: string
): Promise<string[]> => {
  const response = await expensesApi.get("/suggestions", {
    params: { field, query },
  });
  return response.data.data;
};
