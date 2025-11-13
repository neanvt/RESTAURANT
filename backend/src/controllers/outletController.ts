import { Request, Response, NextFunction } from "express";
import outletService from "../services/outletService";
import { IOutlet } from "../models/Outlet";

/**
 * Get all outlets for the authenticated user
 */
export const getAllOutlets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      });
      return;
    }

    const outlets = await outletService.getOutletsByUser(userId);

    res.status(200).json({
      success: true,
      data: outlets,
      message: "Outlets fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new outlet
 */
export const createOutlet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      });
      return;
    }

    console.log("Received outlet creation request from user:", userId);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const outletData: Partial<IOutlet> = req.body;

    // Validate required fields with proper trimming
    if (!outletData.businessName || !outletData.businessName.trim()) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Business name is required",
        },
      });
      return;
    }

    // Validate address fields - check for empty strings too
    if (!outletData.address) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Address is required",
        },
      });
      return;
    }

    if (!outletData.address.street || !outletData.address.street.trim()) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Street address is required",
        },
      });
      return;
    }

    if (!outletData.address.city || !outletData.address.city.trim()) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "City is required",
        },
      });
      return;
    }

    if (!outletData.address.state || !outletData.address.state.trim()) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "State is required",
        },
      });
      return;
    }

    if (!outletData.address.pincode || !outletData.address.pincode.trim()) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Pincode is required",
        },
      });
      return;
    }

    if (
      !outletData.contact ||
      !outletData.contact.phone ||
      !outletData.contact.phone.trim()
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Contact phone is required",
        },
      });
      return;
    }

    console.log("Validation passed, creating outlet...");
    const outlet = await outletService.createOutlet(userId, outletData);

    console.log("Outlet created successfully:", outlet._id);
    res.status(201).json({
      success: true,
      data: outlet,
      message: "Outlet created successfully",
    });
  } catch (error: any) {
    console.error("Error in createOutlet controller:", error);
    next(error);
  }
};

/**
 * Get outlet by ID
 */
export const getOutletById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      });
      return;
    }

    const outlet = await outletService.getOutletById(id, userId);

    if (!outlet) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Outlet not found",
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: outlet,
      message: "Outlet fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update outlet
 */
export const updateOutlet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const updateData: Partial<IOutlet> = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      });
      return;
    }

    const outlet = await outletService.updateOutlet(id, userId, updateData);

    if (!outlet) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Outlet not found or unauthorized",
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: outlet,
      message: "Outlet updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete outlet (soft delete)
 */
export const deleteOutlet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      });
      return;
    }

    const result = await outletService.deleteOutlet(id, userId);

    if (!result) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Outlet not found or unauthorized",
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "Outlet deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Select outlet as current
 */
export const selectOutlet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      });
      return;
    }

    const outlet = await outletService.selectOutlet(id, userId);

    res.status(200).json({
      success: true,
      data: outlet,
      message: "Outlet selected successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload outlet logo
 */
export const uploadOutletLogo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "No file uploaded",
        },
      });
      return;
    }

    // File path relative to project root - include outlets subdirectory
    const logoPath = `/uploads/outlets/${req.file.filename}`;

    const outlet = await outletService.updateOutletLogo(id, userId, logoPath);

    if (!outlet) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Outlet not found or unauthorized",
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: outlet,
      message: "Logo uploaded successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete outlet logo
 */
export const deleteOutletLogo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      });
      return;
    }

    const outlet = await outletService.deleteOutletLogo(id, userId);

    if (!outlet) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Outlet not found or unauthorized",
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: outlet,
      message: "Logo deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current outlet
 */
export const getCurrentOutlet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      });
      return;
    }

    const outlet = await outletService.getCurrentOutlet(userId);

    if (!outlet) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "No current outlet found",
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: outlet,
      message: "Current outlet fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get outlet statistics
 */
export const getOutletStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      });
      return;
    }

    const stats = await outletService.getOutletStats(id, userId);

    res.status(200).json({
      success: true,
      data: stats,
      message: "Outlet statistics fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};
