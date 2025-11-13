import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import Outlet from "../models/Outlet";

// Extend Express Request to include outlet
declare global {
  namespace Express {
    interface Request {
      outletId?: string;
      outlet?: any;
      currentOutlet?: string;
    }
  }
}

/**
 * Middleware to verify user has access to the specified outlet
 */
export const verifyOutletAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const outletId = req.params.id || req.params.outletId || req.body.outletId;

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

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Outlet ID is required",
        },
      });
      return;
    }

    // Check if outlet exists and user has access
    const outlet = await Outlet.findOne({
      _id: outletId,
      ownerId: userId,
      isActive: true,
    });

    if (!outlet) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Access denied to this outlet",
        },
      });
      return;
    }

    // Attach outlet info to request
    req.outletId = outletId;
    req.outlet = outlet;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to attach current outlet to request
 * This is used for routes that need the current outlet context
 */
export const attachCurrentOutlet = async (
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

    // Get user's current outlet
    const user = await User.findById(userId);

    // If user has no currentOutlet, allow frontend to pass x-outlet-id as a fallback
    let outletIdToUse: string | undefined = undefined;
    if (user && user.currentOutlet) {
      outletIdToUse = user.currentOutlet.toString();
    } else {
      // Check header or query for outlet id fallback
      const headerOutlet = (req.headers["x-outlet-id"] ||
        req.query.outletId) as string | undefined;
      if (headerOutlet) {
        outletIdToUse = headerOutlet;
      }
    }

    if (!user && !outletIdToUse) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_CURRENT_OUTLET",
          message: "No outlet selected. Please select an outlet first.",
        },
      });
      return;
    }

    // Debug: log which outlet id we're attempting to use (helps diagnose 400s)
    console.debug(
      "attachCurrentOutlet: userId=",
      userId,
      "user.currentOutlet=",
      user?.currentOutlet,
      "headerOutlet=",
      req.headers["x-outlet-id"],
      "queryOutlet=",
      req.query.outletId
    );

    // Verify outlet exists and is active using the chosen outlet id
    const outlet = await Outlet.findOne({
      _id: outletIdToUse,
      isActive: true,
    });

    if (!outlet) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_OUTLET",
          message: "Current outlet is invalid or inactive",
        },
      });
      return;
    }

    // If the user did not have this outlet as current, ensure they have access to it
    if (user) {
      const outletIdStr = outlet._id?.toString() || "";
      const userOutlets = (user.outlets || []).map((o: any) => o.toString());
      const hasAccess =
        userOutlets.includes(outletIdStr) ||
        outlet.ownerId?.toString() === user._id?.toString();

      if (!hasAccess) {
        res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Access denied to this outlet",
          },
        });
        return;
      }
    }

    // Attach outlet info to request
    req.outletId = outlet._id?.toString() || "";
    req.currentOutlet = outlet._id?.toString() || "";
    req.outlet = outlet;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to filter query by outlet
 * Automatically adds outletId filter to queries
 */
export const filterByOutlet = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    if (req.outletId) {
      // Add outletId to query parameters
      req.query.outletId = req.outletId;

      // Add outletId to body if it's a POST/PUT request
      if (req.method === "POST" || req.method === "PUT") {
        req.body.outletId = req.outletId;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to ensure user has at least one outlet
 */
export const requireOutlet = async (
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

    const user = await User.findById(userId);

    if (!user || !user.outlets || user.outlets.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_OUTLET",
          message: "Please create an outlet first",
        },
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to validate outlet ownership
 * Checks if the authenticated user owns the outlet in the request
 */
export const validateOutletOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const outletId =
      req.body.outletId || req.query.outletId || req.params.outletId;

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

    if (!outletId) {
      next();
      return;
    }

    // Check if user owns the outlet
    const outlet = await Outlet.findOne({
      _id: outletId,
      ownerId: userId,
    });

    if (!outlet) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not own this outlet",
        },
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
