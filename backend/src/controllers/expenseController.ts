import { Request, Response } from "express";
import expenseService from "../services/expenseService";

/**
 * Create new expense
 */
export const createExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const userId = req.user?.userId;

    if (!outletId || !userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const expense = await expenseService.createExpense({
      ...req.body,
      outletId,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense,
    });
  } catch (error: any) {
    console.error("Error creating expense:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create expense",
    });
  }
};

/**
 * Get all expenses with filters
 */
export const getExpenses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const filters: any = {};

    // Apply filters from query params
    if (req.query.category) filters.category = req.query.category as string;
    if (req.query.paymentMethod)
      filters.paymentMethod = req.query.paymentMethod as string;
    if (req.query.startDate)
      filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate)
      filters.endDate = new Date(req.query.endDate as string);
    if (req.query.minAmount)
      filters.minAmount = parseFloat(req.query.minAmount as string);
    if (req.query.maxAmount)
      filters.maxAmount = parseFloat(req.query.maxAmount as string);
    if (req.query.search) filters.search = req.query.search as string;

    const expenses = await expenseService.getExpenses(outletId, filters);

    res.json({
      success: true,
      data: expenses,
    });
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch expenses",
    });
  }
};

/**
 * Get expense by ID
 */
export const getExpenseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { id } = req.params;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const expense = await expenseService.getExpenseById(id, outletId);

    if (!expense) {
      res.status(404).json({
        success: false,
        message: "Expense not found",
      });
      return;
    }

    res.json({
      success: true,
      data: expense,
    });
  } catch (error: any) {
    console.error("Error fetching expense:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch expense",
    });
  }
};

/**
 * Update expense
 */
export const updateExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { id } = req.params;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const expense = await expenseService.updateExpense(id, outletId, req.body);

    if (!expense) {
      res.status(404).json({
        success: false,
        message: "Expense not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (error: any) {
    console.error("Error updating expense:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update expense",
    });
  }
};

/**
 * Delete expense
 */
export const deleteExpense = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { id } = req.params;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const deleted = await expenseService.deleteExpense(id, outletId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Expense not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting expense:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete expense",
    });
  }
};

/**
 * Get expense summary by category
 */
export const getExpenseSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (req.query.startDate) {
      startDate = new Date(req.query.startDate as string);
    }
    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
    }

    const summary = await expenseService.getExpenseSummary(
      outletId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error("Error fetching expense summary:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch expense summary",
    });
  }
};

/**
 * Get expense trends
 */
export const getExpenseTrends = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const groupBy = (req.query.groupBy as "day" | "week" | "month") || "day";

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
      return;
    }

    const trends = await expenseService.getExpenseTrends(
      outletId,
      startDate,
      endDate,
      groupBy
    );

    res.json({
      success: true,
      data: trends,
    });
  } catch (error: any) {
    console.error("Error fetching expense trends:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch expense trends",
    });
  }
};

/**
 * Get autocomplete suggestions for expense fields
 */
export const getExpenseSuggestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { field, query } = req.query;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!field || !query) {
      res.status(400).json({
        success: false,
        message: "Field and query parameters are required",
      });
      return;
    }

    const suggestions = await expenseService.getExpenseSuggestions(
      outletId,
      field as string,
      query as string
    );

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error: any) {
    console.error("Error fetching expense suggestions:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch suggestions",
    });
  }
};
