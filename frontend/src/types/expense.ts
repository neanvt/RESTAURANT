// Allow any string for custom categories
export type ExpenseCategory = string;

export type PaymentMethod =
  | "cash"
  | "upi"
  | "bank_transfer"
  | "card"
  | "cheque";

export interface Expense {
  _id: string;
  outlet: string;
  category: ExpenseCategory;
  amount: number;
  price?: number;
  quantity?: number;
  description: string;
  date: Date | string;
  paidTo: string;
  paymentMethod: PaymentMethod;
  receipt?: string;
  notes?: string;
  createdBy: {
    _id: string;
    name: string;
    phone: string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateExpenseInput {
  category: ExpenseCategory;
  amount: number;
  price?: number;
  quantity?: number;
  description: string;
  date: Date | string;
  paidTo: string;
  paymentMethod: PaymentMethod;
  receipt?: string;
  notes?: string;
}

export interface UpdateExpenseInput {
  category?: ExpenseCategory;
  amount?: number;
  price?: number;
  quantity?: number;
  description?: string;
  date?: Date | string;
  paidTo?: string;
  paymentMethod?: PaymentMethod;
  receipt?: string;
  notes?: string;
}

export interface ExpenseFilters {
  category?: ExpenseCategory;
  paymentMethod?: PaymentMethod;
  startDate?: Date | string;
  endDate?: Date | string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface ExpenseSummary {
  summary: Array<{
    category: ExpenseCategory;
    totalAmount: number;
    count: number;
    avgAmount: number;
  }>;
  total: number;
  categories: number;
}

export interface ExpenseTrend {
  period: string;
  totalAmount: number;
  count: number;
}

// Predefined categories for suggestions (optional to use)
export const DEFAULT_EXPENSE_CATEGORIES = [
  "Ingredients",
  "Utilities",
  "Salary",
  "Rent",
  "Maintenance",
  "Marketing",
  "Equipment",
  "Other",
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  { value: "cheque", label: "Cheque" },
];
