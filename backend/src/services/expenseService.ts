import Expense, { IExpense } from "../models/Expense";
import mongoose from "mongoose";

export class ExpenseService {
  /**
   * Create new expense
   */
  async createExpense(data: {
    outletId: string;
    category: string;
    amount: number;
    description: string;
    date: Date;
    paidTo: string;
    paymentMethod: string;
    receipt?: string;
    notes?: string;
    createdBy: string;
  }): Promise<IExpense> {
    const expense = await Expense.create({
      outlet: data.outletId,
      category: data.category,
      amount: data.amount,
      description: data.description,
      date: data.date,
      paidTo: data.paidTo,
      paymentMethod: data.paymentMethod,
      receipt: data.receipt,
      notes: data.notes,
      createdBy: data.createdBy,
    });

    return expense;
  }

  /**
   * Get expenses with filters
   */
  async getExpenses(
    outletId: string,
    filters?: {
      category?: string;
      paymentMethod?: string;
      startDate?: Date;
      endDate?: Date;
      minAmount?: number;
      maxAmount?: number;
      search?: string;
    }
  ): Promise<IExpense[]> {
    const query: any = { outlet: outletId };

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.paymentMethod) {
      query.paymentMethod = filters.paymentMethod;
    }

    if (filters?.startDate || filters?.endDate) {
      query.date = {};
      if (filters.startDate) {
        query.date.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.date.$lte = filters.endDate;
      }
    }

    if (filters?.minAmount !== undefined || filters?.maxAmount !== undefined) {
      query.amount = {};
      if (filters.minAmount !== undefined) {
        query.amount.$gte = filters.minAmount;
      }
      if (filters.maxAmount !== undefined) {
        query.amount.$lte = filters.maxAmount;
      }
    }

    if (filters?.search) {
      query.$or = [
        { description: { $regex: filters.search, $options: "i" } },
        { paidTo: { $regex: filters.search, $options: "i" } },
        { notes: { $regex: filters.search, $options: "i" } },
      ];
    }

    const expenses = await Expense.find(query)
      .populate("createdBy", "name phone")
      .sort({ date: -1, createdAt: -1 });

    return expenses;
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(id: string, outletId: string): Promise<IExpense | null> {
    const expense = await Expense.findOne({ _id: id, outlet: outletId })
      .populate("createdBy", "name phone")
      .populate("outlet", "businessName");

    return expense;
  }

  /**
   * Update expense
   */
  async updateExpense(
    id: string,
    outletId: string,
    data: Partial<IExpense>
  ): Promise<IExpense | null> {
    const expense = await Expense.findOneAndUpdate(
      { _id: id, outlet: outletId },
      { $set: data },
      { new: true, runValidators: true }
    ).populate("createdBy", "name phone");

    return expense;
  }

  /**
   * Delete expense
   */
  async deleteExpense(id: string, outletId: string): Promise<boolean> {
    const result = await Expense.deleteOne({ _id: id, outlet: outletId });
    return result.deletedCount > 0;
  }

  /**
   * Get expense summary by category
   */
  async getExpenseSummary(
    outletId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    const matchQuery: any = { outlet: new mongoose.Types.ObjectId(outletId) };

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = startDate;
      if (endDate) matchQuery.date.$lte = endDate;
    }

    const summary = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
        },
      },
      {
        $project: {
          category: "$_id",
          totalAmount: 1,
          count: 1,
          avgAmount: { $round: ["$avgAmount", 2] },
          _id: 0,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Calculate total
    const total = summary.reduce((sum, item) => sum + item.totalAmount, 0);

    return {
      summary,
      total,
      categories: summary.length,
    };
  }

  /**
   * Get expense trends
   */
  async getExpenseTrends(
    outletId: string,
    startDate: Date,
    endDate: Date,
    groupBy: "day" | "week" | "month" = "day"
  ): Promise<any[]> {
    const dateFormat: any = {
      day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
      week: { $dateToString: { format: "%Y-W%V", date: "$date" } },
      month: { $dateToString: { format: "%Y-%m", date: "$date" } },
    };

    const trends = await Expense.aggregate([
      {
        $match: {
          outlet: new mongoose.Types.ObjectId(outletId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: dateFormat[groupBy],
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          period: "$_id",
          totalAmount: 1,
          count: 1,
          _id: 0,
        },
      },
      { $sort: { period: 1 } },
    ]);

    return trends;
  }

  /**
   * Get autocomplete suggestions for expense fields
   */
  async getExpenseSuggestions(
    outletId: string,
    field: string,
    query: string
  ): Promise<string[]> {
    if (!["description", "paidTo", "category"].includes(field)) {
      return [];
    }

    // Get distinct values for the field that match the query
    const suggestions = await Expense.aggregate([
      {
        $match: {
          outlet: new mongoose.Types.ObjectId(outletId),
          [field]: { $regex: query, $options: "i" },
        },
      },
      {
        $group: {
          _id: `$${field}`,
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 0,
          value: "$_id",
        },
      },
    ]);

    return suggestions.map((s) => s.value).filter((v) => v && v.trim());
  }
}

export default new ExpenseService();
