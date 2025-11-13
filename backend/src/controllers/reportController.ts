import { Request, Response } from "express";
import Order from "../models/Order";
import Invoice from "../models/Invoice";
import Customer from "../models/Customer";
import mongoose from "mongoose";

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Today's stats
    const [todayOrders, todayRevenue, todayInvoices] = await Promise.all([
      Order.countDocuments({
        outletId: req.outlet._id,
        createdAt: { $gte: today },
      }),
      Order.aggregate([
        {
          $match: {
            outletId: req.outlet._id,
            createdAt: { $gte: today },
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]),
      Invoice.countDocuments({
        outletId: req.outlet._id,
        createdAt: { $gte: today },
        paymentStatus: "paid",
      }),
    ]);

    // Yesterday's stats
    const [yesterdayOrders, yesterdayRevenue] = await Promise.all([
      Order.countDocuments({
        outletId: req.outlet._id,
        createdAt: { $gte: yesterday, $lt: today },
      }),
      Order.aggregate([
        {
          $match: {
            outletId: req.outlet._id,
            createdAt: { $gte: yesterday, $lt: today },
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$total" },
          },
        },
      ]),
    ]);

    // Month-to-date stats
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthRevenue = await Order.aggregate([
      {
        $match: {
          outletId: req.outlet._id,
          createdAt: { $gte: monthStart },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        today: {
          orders: todayOrders,
          revenue: todayRevenue[0]?.total || 0,
          invoices: todayInvoices,
        },
        yesterday: {
          orders: yesterdayOrders,
          revenue: yesterdayRevenue[0]?.total || 0,
        },
        monthToDate: {
          revenue: monthRevenue[0]?.total || 0,
        },
      },
    });
  } catch (error: any) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to fetch dashboard statistics",
      },
    });
  }
};

/**
 * Get sales report by date range
 */
export const getSalesReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Start date and end date are required",
        },
      });
      return;
    }

    // Parse dates as local timezone by extracting components
    const parseLocalDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    const start = parseLocalDate(startDate as string);
    start.setHours(0, 0, 0, 0);

    const end = parseLocalDate(endDate as string);
    end.setHours(23, 59, 59, 999);

    // Determine grouping format
    let dateFormat: any;
    switch (groupBy) {
      case "hour":
        dateFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
          hour: { $hour: "$createdAt" },
        };
        break;
      case "day":
        dateFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
        break;
      case "week":
        dateFormat = {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        };
        break;
      case "month":
        dateFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };
        break;
      default:
        dateFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          outletId: req.outlet._id,
          createdAt: { $gte: start, $lte: end },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: dateFormat,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          totalTax: { $sum: "$taxAmount" },
          averageOrderValue: { $avg: "$total" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // Summary statistics
    const summary = await Order.aggregate([
      {
        $match: {
          outletId: req.outlet._id,
          createdAt: { $gte: start, $lte: end },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          totalTax: { $sum: "$taxAmount" },
          averageOrderValue: { $avg: "$total" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        summary: summary[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          totalTax: 0,
          averageOrderValue: 0,
        },
      },
    });
  } catch (error: any) {
    console.error("Get sales report error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to fetch sales report",
      },
    });
  }
};

/**
 * Get item-wise sales report
 */
export const getItemSalesReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate, categoryId } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Start date and end date are required",
        },
      });
      return;
    }

    // Parse dates as local timezone by extracting components
    const parseLocalDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    const start = parseLocalDate(startDate as string);
    start.setHours(0, 0, 0, 0);

    const end = parseLocalDate(endDate as string);
    end.setHours(23, 59, 59, 999);

    const matchStage: any = {
      outletId: req.outlet._id,
      createdAt: { $gte: start, $lte: end },
      status: { $ne: "cancelled" },
    };

    const itemSales = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "items",
          localField: "items.item",
          foreignField: "_id",
          as: "itemDetails",
        },
      },
      { $unwind: "$itemDetails" },
      ...(categoryId
        ? [
            {
              $match: {
                "itemDetails.category": new mongoose.Types.ObjectId(
                  categoryId as string
                ),
              },
            },
          ]
        : []),
      {
        $group: {
          _id: "$items.item",
          itemName: { $first: "$itemDetails.name" },
          categoryName: { $first: "$itemDetails.category" },
          quantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
          averagePrice: { $avg: "$items.price" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryName",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          itemName: 1,
          categoryName: { $arrayElemAt: ["$category.name", 0] },
          quantitySold: 1,
          totalRevenue: 1,
          averagePrice: 1,
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json({
      success: true,
      data: itemSales,
    });
  } catch (error: any) {
    console.error("Get item sales report error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to fetch item sales report",
      },
    });
  }
};

/**
 * Get category-wise sales report
 */
export const getCategorySalesReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Start date and end date are required",
        },
      });
      return;
    }

    // Parse dates as local timezone by extracting components
    const parseLocalDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    const start = parseLocalDate(startDate as string);
    start.setHours(0, 0, 0, 0);

    const end = parseLocalDate(endDate as string);
    end.setHours(23, 59, 59, 999);

    const categorySales = await Order.aggregate([
      {
        $match: {
          outletId: req.outlet._id,
          createdAt: { $gte: start, $lte: end },
          status: { $ne: "cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "items",
          localField: "items.item",
          foreignField: "_id",
          as: "itemDetails",
        },
      },
      { $unwind: "$itemDetails" },
      {
        $lookup: {
          from: "categories",
          localField: "itemDetails.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
          categoryName: { $first: "$category.name" },
          quantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
          itemCount: { $addToSet: "$items.item" },
        },
      },
      {
        $project: {
          categoryName: 1,
          quantitySold: 1,
          totalRevenue: 1,
          uniqueItems: { $size: "$itemCount" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json({
      success: true,
      data: categorySales,
    });
  } catch (error: any) {
    console.error("Get category sales report error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to fetch category sales report",
      },
    });
  }
};

/**
 * Get payment method analysis
 */
export const getPaymentMethodReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Start date and end date are required",
        },
      });
      return;
    }

    // Parse dates as local timezone by extracting components
    const parseLocalDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    const start = parseLocalDate(startDate as string);
    start.setHours(0, 0, 0, 0);

    const end = parseLocalDate(endDate as string);
    end.setHours(23, 59, 59, 999);

    const paymentAnalysis = await Invoice.aggregate([
      {
        $match: {
          outletId: req.outlet._id,
          createdAt: { $gte: start, $lte: end },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total" },
          averageAmount: { $avg: "$total" },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json({
      success: true,
      data: paymentAnalysis,
    });
  } catch (error: any) {
    console.error("Get payment method report error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to fetch payment method report",
      },
    });
  }
};

/**
 * Get top selling items
 */
export const getTopSellingItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Start date and end date are required",
        },
      });
      return;
    }

    // Parse dates as local timezone by extracting components
    const parseLocalDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    };

    const start = parseLocalDate(startDate as string);
    start.setHours(0, 0, 0, 0);

    const end = parseLocalDate(endDate as string);
    end.setHours(23, 59, 59, 999);

    const topItems = await Order.aggregate([
      {
        $match: {
          outletId: req.outlet._id,
          createdAt: { $gte: start, $lte: end },
          status: { $ne: "cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.item",
          itemName: { $first: "$items.name" },
          quantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: parseInt(limit as string) },
    ]);

    res.json({
      success: true,
      data: topItems,
    });
  } catch (error: any) {
    console.error("Get top selling items error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to fetch top selling items",
      },
    });
  }
};

/**
 * Get customer analytics
 */
export const getCustomerAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Parse dates as local timezone by extracting components
    const parseLocalDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date;
    };

    const start = startDate ? parseLocalDate(startDate as string) : new Date(0);
    if (startDate) start.setHours(0, 0, 0, 0);

    const end = endDate ? parseLocalDate(endDate as string) : new Date();
    end.setHours(23, 59, 59, 999);

    const [totalCustomers, newCustomers, topCustomers, customerGrowth] =
      await Promise.all([
        Customer.countDocuments({
          outletId: req.outlet._id,
          isActive: true,
        }),
        Customer.countDocuments({
          outletId: req.outlet._id,
          createdAt: { $gte: start, $lte: end },
        }),
        Customer.find({
          outletId: req.outlet._id,
          isActive: true,
        })
          .sort({ totalSpent: -1 })
          .limit(10)
          .select("name phone totalOrders totalSpent")
          .lean(),
        Customer.aggregate([
          {
            $match: {
              outletId: req.outlet._id,
              createdAt: { $gte: start, $lte: end },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        newCustomers,
        topCustomers,
        customerGrowth,
      },
    });
  } catch (error: any) {
    console.error("Get customer analytics error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to fetch customer analytics",
      },
    });
  }
};
