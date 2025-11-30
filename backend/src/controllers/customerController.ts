import { Request, Response } from "express";
import { Types } from "mongoose";
import Customer from "../models/Customer";
import Order from "../models/Order";

/**
 * Create new customer
 */
export const createCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      phone,
      email,
      address,
      dateOfBirth,
      anniversary,
      tags,
      notes,
    } = req.body;

    // Check if customer with same phone already exists in this outlet
    const existingCustomer = await Customer.findOne({
      outlet: req.outlet._id,
      phone,
    });

    if (existingCustomer) {
      res.status(400).json({
        success: false,
        error: {
          code: "CUSTOMER_EXISTS",
          message: "Customer with this phone number already exists",
        },
      });
      return;
    }

    // Convert userId string to ObjectId
    const createdByObjectId = new Types.ObjectId(req.user!.userId);

    const customer = await Customer.create({
      outlet: req.outlet._id,
      name,
      phone,
      email,
      address,
      dateOfBirth,
      anniversary,
      tags,
      notes,
      createdBy: createdByObjectId,
    });

    res.status(201).json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    console.error("Create customer error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to create customer",
      },
    });
  }
};

/**
 * Get all customers with filters and search
 */
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const {
      search,
      tags,
      isActive,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const query: any = { outlet: req.outlet._id };

    // Search by name, phone, or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by tags
    if (tags) {
      const tagArray = (tags as string).split(",");
      query.tags = { $in: tagArray };
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate as string);
      }
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Customer.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        customers,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("Get customers error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to fetch customers",
      },
    });
  }
};

/**
 * Get single customer by ID with statistics
 */
export const getCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({
      _id: id,
      outlet: req.outlet._id,
    }).lean();

    if (!customer) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Customer not found",
        },
      });
      return;
    }

    // Get recent orders
    const recentOrders = await Order.find({
      outlet: req.outlet._id,
      "customer.phone": customer.phone,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("orderNumber status total createdAt")
      .lean();

    // Get customer statistics
    const stats = await Order.aggregate([
      {
        $match: {
          outlet: req.outlet._id,
          "customer.phone": customer.phone,
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          averageOrderValue: { $avg: "$total" },
        },
      },
    ]);

    const customerStats = stats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
    };

    res.json({
      success: true,
      data: {
        customer,
        statistics: customerStats,
        recentOrders,
      },
    });
  } catch (error: any) {
    console.error("Get customer error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to fetch customer",
      },
    });
  }
};

/**
 * Update customer
 */
export const updateCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      email,
      address,
      dateOfBirth,
      anniversary,
      tags,
      notes,
      isActive,
    } = req.body;

    // Check if phone is being changed and if it already exists
    if (phone) {
      const existingCustomer = await Customer.findOne({
        outlet: req.outlet._id,
        phone,
        _id: { $ne: id },
      });

      if (existingCustomer) {
        res.status(400).json({
          success: false,
          error: {
            code: "PHONE_EXISTS",
            message: "Another customer with this phone number already exists",
          },
        });
        return;
      }
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: id, outlet: req.outlet._id },
      {
        name,
        phone,
        email,
        address,
        dateOfBirth,
        anniversary,
        tags,
        notes,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!customer) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Customer not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    console.error("Update customer error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to update customer",
      },
    });
  }
};

/**
 * Delete customer
 */
export const deleteCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOneAndDelete({
      _id: id,
      outlet: req.outlet._id,
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Customer not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete customer error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to delete customer",
      },
    });
  }
};

/**
 * Search customers by phone
 */
export const searchByPhone = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone } = req.query;

    if (!phone) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Phone number is required",
        },
      });
      return;
    }

    const customers = await Customer.find({
      outlet: req.outlet._id,
      phone: { $regex: phone, $options: "i" },
      isActive: true,
    })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: customers,
    });
  } catch (error: any) {
    console.error("Search by phone error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to search customers",
      },
    });
  }
};

/**
 * Get customer statistics for dashboard
 */
export const getCustomerStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = { outlet: req.outlet._id };

    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate as string);
      }
    }

    const [totalCustomers, activeCustomers, _newCustomersToday, topCustomers] =
      await Promise.all([
        Customer.countDocuments({ outlet: req.outlet._id }),
        Customer.countDocuments({ outlet: req.outlet._id, isActive: true }),
        Customer.countDocuments({
          outlet: req.outlet._id,
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        }),
        Customer.find({ outlet: req.outlet._id })
          .sort({ totalSpent: -1 })
          .limit(10)
          .select("name phone totalOrders totalSpent")
          .lean(),
      ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        topCustomers,
      },
    });
  } catch (error: any) {
    console.error("Get customer stats error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error.message || "Failed to fetch customer statistics",
      },
    });
  }
};
