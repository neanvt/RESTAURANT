import User, { IUser } from "../models/User";
import StaffActivity from "../models/StaffActivity";
import mongoose from "mongoose";

export class StaffService {
  /**
   * Get all staff members for an outlet
   */
  async getStaffByOutlet(outletId: string): Promise<IUser[]> {
    const staff = await User.find({
      outlets: outletId,
      isActive: true,
    })
      .select("-__v")
      .sort({ createdAt: -1 });

    return staff;
  }

  /**
   * Get staff member by ID
   */
  async getStaffById(staffId: string): Promise<IUser | null> {
    const staff = await User.findById(staffId)
      .populate("invitedBy", "name phone")
      .select("-__v");

    return staff;
  }

  /**
   * Invite a new staff member
   */
  async inviteStaff(data: {
    phone: string;
    name: string;
    role: "secondary_admin" | "staff" | "waiter" | "kitchen";
    outletId: string;
    invitedBy: string;
    permissions?: string[];
  }): Promise<IUser> {
    // Check if user already exists
    let user = await User.findOne({ phone: data.phone });

    if (user) {
      // User exists, add outlet if not already added
      if (!user.outlets.includes(new mongoose.Types.ObjectId(data.outletId))) {
        user.outlets.push(new mongoose.Types.ObjectId(data.outletId));
        user.role = data.role;
        user.permissions =
          data.permissions || this.getDefaultPermissions(data.role);
        user.status = "joined";
        // Set currentOutlet if not already set
        if (!user.currentOutlet) {
          user.currentOutlet = new mongoose.Types.ObjectId(data.outletId);
        }
        
        // Set default password if user doesn't have one
        if (!user.password) {
          const bcrypt = await import("bcrypt");
          const DEFAULT_PASSWORD = "Utkranti@123";
          const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
          user.password = hashedPassword;
          user.requirePasswordChange = true;
        }
        
        await user.save();
      } else {
        throw new Error("User already added to this outlet");
      }
    } else {
      // Create new user with currentOutlet set to the outlet they're being invited to
      // Set default password for new invited users
      const bcrypt = await import("bcrypt");
      const DEFAULT_PASSWORD = "Utkranti@123";
      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

      user = await User.create({
        phone: data.phone,
        name: data.name,
        role: data.role,
        outlets: [data.outletId],
        currentOutlet: data.outletId,
        permissions: data.permissions || this.getDefaultPermissions(data.role),
        invitedBy: data.invitedBy,
        status: "invited",
        password: hashedPassword,
        requirePasswordChange: true,
        isActive: true,
      });
    }

    return user;
  }

  /**
   * Update staff member
   */
  async updateStaff(
    staffId: string,
    data: {
      name?: string;
      role?: "secondary_admin" | "staff" | "waiter" | "kitchen";
      permissions?: string[];
      status?: "invited" | "joined" | "suspended";
    }
  ): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(
      staffId,
      {
        $set: data,
      },
      { new: true, runValidators: true }
    );

    return user;
  }

  /**
   * Remove staff member from outlet
   */
  async removeStaffFromOutlet(
    staffId: string,
    outletId: string
  ): Promise<boolean> {
    const user = await User.findById(staffId);

    if (!user) {
      throw new Error("Staff member not found");
    }

    // Check if user is primary admin
    if (user.role === "primary_admin") {
      throw new Error("Cannot remove primary admin");
    }

    // Remove outlet from user's outlets
    user.outlets = user.outlets.filter(
      (outlet) => outlet.toString() !== outletId
    );

    // If no outlets left, deactivate user
    if (user.outlets.length === 0) {
      user.isActive = false;
    }

    await user.save();
    return true;
  }

  /**
   * Log staff activity
   */
  async logActivity(data: {
    userId: string;
    outletId: string;
    action: string;
    actionType: string;
    metadata?: any;
    ipAddress: string;
    userAgent?: string;
  }): Promise<void> {
    await StaffActivity.create({
      user: data.userId,
      outlet: data.outletId,
      action: data.action,
      actionType: data.actionType,
      metadata: data.metadata || {},
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      timestamp: new Date(),
    });
  }

  /**
   * Get staff activity log
   */
  async getStaffActivity(
    outletId: string,
    filters?: {
      userId?: string;
      actionType?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<any[]> {
    const query: any = { outlet: outletId };

    if (filters?.userId) {
      query.user = filters.userId;
    }

    if (filters?.actionType) {
      query.actionType = filters.actionType;
    }

    if (filters?.startDate || filters?.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.timestamp.$lte = filters.endDate;
      }
    }

    const activities = await StaffActivity.find(query)
      .populate("user", "name phone role")
      .sort({ timestamp: -1 })
      .limit(filters?.limit || 100);

    return activities;
  }

  /**
   * Get default permissions for role
   */
  private getDefaultPermissions(role: string): string[] {
    switch (role) {
      case "secondary_admin":
        return [
          "manage_items",
          "manage_orders",
          "manage_customers",
          "view_reports",
          "manage_staff",
          "manage_expenses",
          "manage_inventory",
        ];
      case "staff":
        return ["manage_orders", "manage_customers", "manage_items"];
      case "waiter":
        return ["manage_orders"];
      case "kitchen":
        // Kitchen staff only need access to KOTs / kitchen order workflow
        return ["manage_kots"];
      default:
        return [];
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      lastActive: new Date(),
    });
  }
}

export default new StaffService();
