import Outlet, { IOutlet } from "../models/Outlet";
import User from "../models/User";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";

export class OutletService {
  /**
   * Create a new outlet
   */
  async createOutlet(
    ownerId: string,
    outletData: Partial<IOutlet>
  ): Promise<IOutlet> {
    try {
      console.log(
        "Creating outlet with data:",
        JSON.stringify(outletData, null, 2)
      );
      console.log("Owner ID:", ownerId);

      const outlet = new Outlet({
        ...outletData,
        ownerId,
      });

      await outlet.save();
      console.log("Outlet saved successfully:", outlet._id);

      // Update user's outlets array and set as current outlet if it's the first one
      const user = await User.findById(ownerId);
      if (!user) {
        throw new Error("User not found");
      }

      console.log("User found, updating outlets array");
      user.outlets.push(outlet._id as mongoose.Types.ObjectId);

      // If this is the first outlet, set it as current
      if (user.outlets.length === 1) {
        user.currentOutlet = outlet._id as mongoose.Types.ObjectId;
        console.log("Setting as current outlet (first outlet)");
      }

      await user.save();
      console.log("User updated successfully");

      return outlet;
    } catch (error: any) {
      console.error("Error creating outlet:", error);

      // Handle Mongoose validation errors specifically
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors)
          .map((err: any) => err.message)
          .join(", ");
        throw new Error(`Validation error: ${messages}`);
      }

      throw new Error(`Failed to create outlet: ${error.message}`);
    }
  }

  /**
   * Get all outlets for a user
   */
  async getOutletsByUser(userId: string): Promise<IOutlet[]> {
    try {
      const outlets = await Outlet.find({
        ownerId: userId,
        isActive: true,
      }).sort({ createdAt: -1 });

      return outlets;
    } catch (error) {
      throw new Error(`Failed to fetch outlets: ${(error as Error).message}`);
    }
  }

  /**
   * Get outlet by ID
   */
  async getOutletById(
    outletId: string,
    userId: string
  ): Promise<IOutlet | null> {
    try {
      const outlet = await Outlet.findOne({
        _id: outletId,
        ownerId: userId,
        isActive: true,
      });

      return outlet;
    } catch (error) {
      throw new Error(`Failed to fetch outlet: ${(error as Error).message}`);
    }
  }

  /**
   * Update outlet
   */
  async updateOutlet(
    outletId: string,
    userId: string,
    updateData: Partial<IOutlet>
  ): Promise<IOutlet | null> {
    try {
      // Prevent updating ownerId
      const { ownerId, ...safeUpdateData } = updateData as any;

      // Debug: Check if outlet exists
      const existingOutlet = await Outlet.findById(outletId);
      if (!existingOutlet) {
        console.error(`[OutletService] Outlet ${outletId} not found`);
        throw new Error("Outlet not found");
      }

      console.log(`[OutletService] Update attempt:`, {
        outletId,
        outletOwner: existingOutlet.ownerId.toString(),
        requestingUser: userId.toString(),
        match: existingOutlet.ownerId.toString() === userId.toString(),
      });

      // Debug: Check ownership
      if (existingOutlet.ownerId.toString() !== userId.toString()) {
        console.error(
          `[OutletService] Unauthorized: Outlet owner=${existingOutlet.ownerId}, User=${userId}`
        );
        throw new Error("Unauthorized to update this outlet");
      }

      const outlet = await Outlet.findOneAndUpdate(
        {
          _id: outletId,
          ownerId: userId,
        },
        { $set: safeUpdateData },
        { new: true, runValidators: true }
      );

      if (!outlet) {
        throw new Error("Outlet not found or unauthorized");
      }

      return outlet;
    } catch (error) {
      throw new Error(`Failed to update outlet: ${(error as Error).message}`);
    }
  }

  /**
   * Delete outlet (soft delete)
   */
  async deleteOutlet(outletId: string, userId: string): Promise<boolean> {
    try {
      const outlet = await Outlet.findOneAndUpdate(
        {
          _id: outletId,
          ownerId: userId,
        },
        { $set: { isActive: false } },
        { new: true }
      );

      if (!outlet) {
        throw new Error("Outlet not found or unauthorized");
      }

      // Remove from user's outlets array
      await User.findByIdAndUpdate(userId, {
        $pull: { outlets: outletId },
      });

      // If this was the current outlet, set another outlet as current
      const user = await User.findById(userId);
      if (user && user.currentOutlet?.toString() === outletId) {
        if (user.outlets.length > 0) {
          user.currentOutlet = user.outlets[0];
          await user.save();
        } else {
          user.currentOutlet = undefined;
          await user.save();
        }
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to delete outlet: ${(error as Error).message}`);
    }
  }

  /**
   * Select outlet as current
   */
  async selectOutlet(outletId: string, userId: string): Promise<IOutlet> {
    try {
      // Verify outlet exists and belongs to user
      const outlet = await Outlet.findOne({
        _id: outletId,
        ownerId: userId,
        isActive: true,
      });

      if (!outlet) {
        throw new Error("Outlet not found or unauthorized");
      }

      // Update user's current outlet
      await User.findByIdAndUpdate(userId, {
        $set: { currentOutlet: outletId },
      });

      return outlet;
    } catch (error) {
      throw new Error(`Failed to select outlet: ${(error as Error).message}`);
    }
  }

  /**
   * Update outlet logo
   */
  async updateOutletLogo(
    outletId: string,
    userId: string,
    logoPath: string
  ): Promise<IOutlet | null> {
    try {
      // Get the old logo path to delete it
      const outlet = await Outlet.findOne({
        _id: outletId,
        ownerId: userId,
      });

      if (!outlet) {
        throw new Error("Outlet not found or unauthorized");
      }

      // Delete old logo if exists
      if (outlet.logo) {
        try {
          const oldLogoPath = path.join(process.cwd(), outlet.logo);
          await fs.unlink(oldLogoPath);
        } catch (err) {
          // Ignore error if file doesn't exist
          console.error("Error deleting old logo:", err);
        }
      }

      // Update with new logo
      outlet.logo = logoPath;
      await outlet.save();

      return outlet;
    } catch (error) {
      throw new Error(
        `Failed to update outlet logo: ${(error as Error).message}`
      );
    }
  }

  /**
   * Delete outlet logo
   */
  async deleteOutletLogo(
    outletId: string,
    userId: string
  ): Promise<IOutlet | null> {
    try {
      const outlet = await Outlet.findOne({
        _id: outletId,
        ownerId: userId,
      });

      if (!outlet) {
        throw new Error("Outlet not found or unauthorized");
      }

      // Delete logo file if exists
      if (outlet.logo) {
        try {
          const logoPath = path.join(process.cwd(), outlet.logo);
          await fs.unlink(logoPath);
        } catch (err) {
          // Ignore error if file doesn't exist
          console.error("Error deleting logo:", err);
        }

        // Remove logo reference from database
        outlet.logo = undefined;
        await outlet.save();
      }

      return outlet;
    } catch (error) {
      throw new Error(
        `Failed to delete outlet logo: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get current outlet for user
   */
  async getCurrentOutlet(userId: string): Promise<IOutlet | null> {
    try {
      const user = await User.findById(userId);

      if (!user || !user.currentOutlet) {
        return null;
      }

      const outlet = await Outlet.findOne({
        _id: user.currentOutlet,
        isActive: true,
      });

      return outlet;
    } catch (error) {
      throw new Error(
        `Failed to fetch current outlet: ${(error as Error).message}`
      );
    }
  }

  /**
   * Verify user has access to outlet
   */
  async verifyOutletAccess(outletId: string, userId: string): Promise<boolean> {
    try {
      const outlet = await Outlet.findOne({
        _id: outletId,
        ownerId: userId,
        isActive: true,
      });

      return !!outlet;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get outlet statistics
   */
  async getOutletStats(outletId: string, userId: string): Promise<any> {
    try {
      const hasAccess = await this.verifyOutletAccess(outletId, userId);

      if (!hasAccess) {
        throw new Error("Unauthorized access to outlet");
      }

      // This will be expanded when we implement other models
      // For now, return basic outlet info
      const outlet = await Outlet.findById(outletId);

      return {
        outlet,
        stats: {
          totalItems: 0, // Will be populated from Items model
          totalOrders: 0, // Will be populated from Orders model
          totalCustomers: 0, // Will be populated from Customers model
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch outlet stats: ${(error as Error).message}`
      );
    }
  }
}

export default new OutletService();
