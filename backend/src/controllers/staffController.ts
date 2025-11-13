import { Request, Response, NextFunction } from "express";
import staffService from "../services/staffService";

export class StaffController {
  /**
   * Get all staff for current outlet
   * GET /api/staff
   */
  async getStaff(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const outletId = req.outletId;

      if (!outletId) {
        res.status(400).json({
          success: false,
          error: {
            code: "OUTLET_REQUIRED",
            message: "Outlet ID is required",
          },
        });
        return;
      }

      const staff = await staffService.getStaffByOutlet(outletId.toString());

      res.json({
        success: true,
        data: staff,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get staff member by ID
   * GET /api/staff/:id
   */
  async getStaffById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const staff = await staffService.getStaffById(id);

      if (!staff) {
        res.status(404).json({
          success: false,
          error: {
            code: "STAFF_NOT_FOUND",
            message: "Staff member not found",
          },
        });
        return;
      }

      res.json({
        success: true,
        data: staff,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Invite new staff member
   * POST /api/staff/invite
   */
  async inviteStaff(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { phone, name, role, permissions } = req.body;
      const outletId = req.outletId;
      const userId = req.user?.userId;

      if (!outletId || !userId) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_REQUIRED_FIELDS",
            message: "Outlet ID and User ID are required",
          },
        });
        return;
      }

      // Validate required fields
      if (!phone || !name || !role) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_REQUIRED_FIELDS",
            message: "Phone, name, and role are required",
          },
        });
        return;
      }

      // Validate role
      if (!["secondary_admin", "staff", "waiter"].includes(role)) {
        res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ROLE",
            message: "Invalid role specified",
          },
        });
        return;
      }

      const staff = await staffService.inviteStaff({
        phone,
        name,
        role,
        outletId: outletId.toString(),
        invitedBy: userId.toString(),
        permissions,
      });

      // Log activity
      await staffService.logActivity({
        userId: userId.toString(),
        outletId: outletId.toString(),
        action: `Invited ${name} as ${role}`,
        actionType: "login",
        metadata: { staffId: staff._id, role },
        ipAddress: req.ip || "unknown",
        userAgent: req.get("user-agent"),
      });

      res.status(201).json({
        success: true,
        data: staff,
        message: "Staff member invited successfully",
      });
    } catch (error: any) {
      if (error.message === "User already added to this outlet") {
        res.status(400).json({
          success: false,
          error: {
            code: "USER_ALREADY_EXISTS",
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Update staff member
   * PUT /api/staff/:id
   */
  async updateStaff(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { name, role, permissions, status } = req.body;
      const userId = req.user?.userId;
      const outletId = req.outletId;

      const staff = await staffService.updateStaff(id, {
        name,
        role,
        permissions,
        status,
      });

      if (!staff) {
        res.status(404).json({
          success: false,
          error: {
            code: "STAFF_NOT_FOUND",
            message: "Staff member not found",
          },
        });
        return;
      }

      // Log activity
      if (userId && outletId) {
        await staffService.logActivity({
          userId: userId.toString(),
          outletId: outletId.toString(),
          action: `Updated staff member ${staff.name}`,
          actionType: "login",
          metadata: { staffId: staff._id, updates: req.body },
          ipAddress: req.ip || "unknown",
          userAgent: req.get("user-agent"),
        });
      }

      res.json({
        success: true,
        data: staff,
        message: "Staff member updated successfully",
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Remove staff member from outlet
   * DELETE /api/staff/:id
   */
  async removeStaff(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const outletId = req.outletId;
      const userId = req.user?.userId;

      if (!outletId) {
        res.status(400).json({
          success: false,
          error: {
            code: "OUTLET_REQUIRED",
            message: "Outlet ID is required",
          },
        });
        return;
      }

      await staffService.removeStaffFromOutlet(id, outletId.toString());

      // Log activity
      if (userId) {
        await staffService.logActivity({
          userId: userId.toString(),
          outletId: outletId.toString(),
          action: `Removed staff member`,
          actionType: "login",
          metadata: { removedStaffId: id },
          ipAddress: req.ip || "unknown",
          userAgent: req.get("user-agent"),
        });
      }

      res.json({
        success: true,
        message: "Staff member removed successfully",
      });
    } catch (error: any) {
      if (error.message === "Cannot remove primary admin") {
        res.status(400).json({
          success: false,
          error: {
            code: "CANNOT_REMOVE_PRIMARY_ADMIN",
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  }

  /**
   * Get staff activity log
   * GET /api/staff/activity
   */
  async getStaffActivity(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const outletId = req.outletId;
      const { userId, actionType, startDate, endDate, limit } = req.query;

      if (!outletId) {
        res.status(400).json({
          success: false,
          error: {
            code: "OUTLET_REQUIRED",
            message: "Outlet ID is required",
          },
        });
        return;
      }

      const filters: any = {};
      if (userId) filters.userId = userId as string;
      if (actionType) filters.actionType = actionType as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (limit) filters.limit = parseInt(limit as string);

      const activities = await staffService.getStaffActivity(
        outletId.toString(),
        filters
      );

      res.json({
        success: true,
        data: activities,
      });
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * Get staff member's activity
   * GET /api/staff/:id/activity
   */
  async getStaffMemberActivity(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const outletId = req.outletId;
      const { startDate, endDate, limit } = req.query;

      if (!outletId) {
        res.status(400).json({
          success: false,
          error: {
            code: "OUTLET_REQUIRED",
            message: "Outlet ID is required",
          },
        });
        return;
      }

      const filters: any = { userId: id };
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (limit) filters.limit = parseInt(limit as string);

      const activities = await staffService.getStaffActivity(
        outletId.toString(),
        filters
      );

      res.json({
        success: true,
        data: activities,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new StaffController();
