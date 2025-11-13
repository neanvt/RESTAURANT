import Inventory, { IInventory, IRestockHistory } from "../models/Inventory";
import mongoose from "mongoose";

export class InventoryService {
  /**
   * Create new inventory item
   */
  async createInventoryItem(data: {
    outletId: string;
    name: string;
    unit: string;
    currentStock: number;
    reorderLevel: number;
    reorderQuantity: number;
    unitCost?: number;
    supplier?: string;
    category?: string;
    createdBy: string;
  }): Promise<IInventory> {
    const item = await Inventory.create({
      outlet: data.outletId,
      name: data.name,
      unit: data.unit,
      currentStock: data.currentStock,
      reorderLevel: data.reorderLevel,
      reorderQuantity: data.reorderQuantity,
      unitCost: data.unitCost,
      supplier: data.supplier,
      category: data.category,
      createdBy: data.createdBy,
    });

    return item;
  }

  /**
   * Get inventory items with filters
   */
  async getInventoryItems(
    outletId: string,
    filters?: {
      category?: string;
      lowStock?: boolean;
      search?: string;
    }
  ): Promise<IInventory[]> {
    const query: any = { outlet: outletId };

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { supplier: { $regex: filters.search, $options: "i" } },
      ];
    }

    let items = await Inventory.find(query)
      .populate("createdBy", "name phone")
      .sort({ name: 1 });

    // Filter low stock items if requested
    if (filters?.lowStock) {
      items = items.filter((item) => item.currentStock <= item.reorderLevel);
    }

    return items;
  }

  /**
   * Get inventory item by ID
   */
  async getInventoryItemById(
    id: string,
    outletId: string
  ): Promise<IInventory | null> {
    const item = await Inventory.findOne({ _id: id, outlet: outletId })
      .populate("createdBy", "name phone")
      .populate("restockHistory.restockedBy", "name phone");

    return item;
  }

  /**
   * Update inventory item
   */
  async updateInventoryItem(
    id: string,
    outletId: string,
    data: Partial<IInventory>
  ): Promise<IInventory | null> {
    const item = await Inventory.findOneAndUpdate(
      { _id: id, outlet: outletId },
      { $set: data },
      { new: true, runValidators: true }
    ).populate("createdBy", "name phone");

    return item;
  }

  /**
   * Delete inventory item
   */
  async deleteInventoryItem(id: string, outletId: string): Promise<boolean> {
    const result = await Inventory.deleteOne({ _id: id, outlet: outletId });
    return result.deletedCount > 0;
  }

  /**
   * Restock inventory item
   */
  async restockItem(
    id: string,
    outletId: string,
    quantity: number,
    cost: number,
    restockedBy: string,
    notes?: string
  ): Promise<IInventory | null> {
    const item = await Inventory.findOne({ _id: id, outlet: outletId });

    if (!item) {
      return null;
    }

    // Add to restock history
    const restockEntry: IRestockHistory = {
      date: new Date(),
      quantity,
      cost,
      restockedBy: new mongoose.Types.ObjectId(restockedBy) as any,
      notes,
    };

    item.restockHistory.push(restockEntry);

    // Update current stock
    item.currentStock += quantity;

    // Update last restock date
    item.lastRestocked = new Date();

    // Clear low stock alert if stock is now above reorder level
    if (item.currentStock > item.reorderLevel) {
      item.lowStockAlert = false;
    }

    await item.save();

    return item.populate("createdBy", "name phone");
  }

  /**
   * Use/consume stock
   */
  async useStock(
    id: string,
    outletId: string,
    quantity: number,
    _usedBy: string,
    _reason?: string
  ): Promise<IInventory | null> {
    const item = await Inventory.findOne({ _id: id, outlet: outletId });

    if (!item) {
      return null;
    }

    // Check if sufficient stock
    if (item.currentStock < quantity) {
      throw new Error(
        `Insufficient stock. Available: ${item.currentStock} ${item.unit}`
      );
    }

    // Reduce current stock
    item.currentStock -= quantity;

    // Check if stock is low
    if (item.currentStock <= item.reorderLevel) {
      item.lowStockAlert = true;
    }

    await item.save();

    return item.populate("createdBy", "name phone");
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(outletId: string): Promise<IInventory[]> {
    const items = await Inventory.find({
      outlet: outletId,
      $expr: { $lte: ["$currentStock", "$reorderLevel"] },
    })
      .populate("createdBy", "name phone")
      .sort({ currentStock: 1 });

    return items;
  }

  /**
   * Get inventory value summary
   */
  async getInventoryValueSummary(outletId: string): Promise<any> {
    const items = await Inventory.find({ outlet: outletId });

    let totalValue = 0;
    let totalItems = items.length;
    let lowStockCount = 0;

    items.forEach((item) => {
      if (item.unitCost) {
        totalValue += item.currentStock * item.unitCost;
      }
      if (item.currentStock <= item.reorderLevel) {
        lowStockCount++;
      }
    });

    return {
      totalValue: Math.round(totalValue * 100) / 100,
      totalItems,
      lowStockCount,
      lowStockPercentage:
        totalItems > 0 ? Math.round((lowStockCount / totalItems) * 100) : 0,
    };
  }

  /**
   * Get restock history for item
   */
  async getRestockHistory(
    id: string,
    outletId: string,
    limit: number = 50
  ): Promise<IRestockHistory[]> {
    const item = await Inventory.findOne({ _id: id, outlet: outletId })
      .populate("restockHistory.restockedBy", "name phone")
      .select("restockHistory");

    if (!item) {
      return [];
    }

    // Sort by date descending and limit
    const history = item.restockHistory
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);

    return history;
  }

  /**
   * Get inventory categories
   */
  async getInventoryCategories(outletId: string): Promise<string[]> {
    const categories = await Inventory.distinct("category", {
      outlet: outletId,
    });

    return categories.filter((c) => c) as string[]; // Remove null/undefined
  }

  /**
   * Get stock movement report
   */
  async getStockMovementReport(
    outletId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    const items = await Inventory.find({ outlet: outletId }).populate(
      "restockHistory.restockedBy",
      "name phone"
    );

    const report = items.map((item) => {
      // Filter restock history within date range
      const restocks = item.restockHistory.filter(
        (r) => r.date >= startDate && r.date <= endDate
      );

      const totalRestocked = restocks.reduce((sum, r) => sum + r.quantity, 0);
      const totalCost = restocks.reduce((sum, r) => sum + (r.cost || 0), 0);

      return {
        itemId: item._id,
        itemName: item.name,
        unit: item.unit,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
        lowStockAlert: item.lowStockAlert,
        totalRestocked,
        totalCost,
        restockCount: restocks.length,
      };
    });

    return report;
  }

  /**
   * Bulk update stock levels (for initial setup or corrections)
   */
  async bulkUpdateStock(
    outletId: string,
    updates: Array<{ itemId: string; newStock: number; notes?: string }>,
    _updatedBy: string
  ): Promise<any> {
    const results = {
      success: [] as string[],
      failed: [] as { itemId: string; error: string }[],
    };

    for (const update of updates) {
      try {
        const item = await Inventory.findOne({
          _id: update.itemId,
          outlet: outletId,
        });

        if (!item) {
          results.failed.push({
            itemId: update.itemId,
            error: "Item not found",
          });
          continue;
        }

        // Update stock
        item.currentStock = update.newStock;

        // Update alert status
        if (item.currentStock <= item.reorderLevel) {
          item.lowStockAlert = true;
        } else {
          item.lowStockAlert = false;
        }

        await item.save();
        results.success.push(update.itemId);
      } catch (error: any) {
        results.failed.push({
          itemId: update.itemId,
          error: error.message,
        });
      }
    }

    return results;
  }
}

export default new InventoryService();
