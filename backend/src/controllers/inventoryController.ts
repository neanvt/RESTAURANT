import { Request, Response } from "express";
import inventoryService from "../services/inventoryService";

/**
 * Create new inventory item
 */
export const createInventoryItem = async (
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

    const item = await inventoryService.createInventoryItem({
      ...req.body,
      outletId,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      data: item,
    });
  } catch (error: any) {
    console.error("Error creating inventory item:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create inventory item",
    });
  }
};

/**
 * Get all inventory items with filters
 */
export const getInventoryItems = async (
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

    if (req.query.category) filters.category = req.query.category as string;
    if (req.query.lowStock) filters.lowStock = req.query.lowStock === "true";
    if (req.query.search) filters.search = req.query.search as string;

    const items = await inventoryService.getInventoryItems(outletId, filters);

    res.json({
      success: true,
      data: items,
    });
  } catch (error: any) {
    console.error("Error fetching inventory items:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch inventory items",
    });
  }
};

/**
 * Get inventory item by ID
 */
export const getInventoryItemById = async (
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

    const item = await inventoryService.getInventoryItemById(id, outletId);

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
      return;
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    console.error("Error fetching inventory item:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch inventory item",
    });
  }
};

/**
 * Update inventory item
 */
export const updateInventoryItem = async (
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

    const item = await inventoryService.updateInventoryItem(
      id,
      outletId,
      req.body
    );

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Inventory item updated successfully",
      data: item,
    });
  } catch (error: any) {
    console.error("Error updating inventory item:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update inventory item",
    });
  }
};

/**
 * Delete inventory item
 */
export const deleteInventoryItem = async (
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

    const deleted = await inventoryService.deleteInventoryItem(id, outletId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete inventory item",
    });
  }
};

/**
 * Restock inventory item
 */
export const restockItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const userId = req.user?.userId;
    const { id } = req.params;
    const { quantity, cost, notes } = req.body;

    if (!outletId || !userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!quantity || !cost) {
      res.status(400).json({
        success: false,
        message: "Quantity and cost are required",
      });
      return;
    }

    const item = await inventoryService.restockItem(
      id,
      outletId,
      quantity,
      cost,
      userId,
      notes
    );

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Item restocked successfully",
      data: item,
    });
  } catch (error: any) {
    console.error("Error restocking item:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to restock item",
    });
  }
};

/**
 * Use/consume stock
 */
export const useStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const userId = req.user?.userId;
    const { id } = req.params;
    const { quantity, reason } = req.body;

    if (!outletId || !userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!quantity) {
      res.status(400).json({
        success: false,
        message: "Quantity is required",
      });
      return;
    }

    const item = await inventoryService.useStock(
      id,
      outletId,
      quantity,
      userId,
      reason
    );

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Stock updated successfully",
      data: item,
    });
  } catch (error: any) {
    console.error("Error using stock:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update stock",
    });
  }
};

/**
 * Get low stock items
 */
export const getLowStockItems = async (
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

    const items = await inventoryService.getLowStockItems(outletId);

    res.json({
      success: true,
      data: items,
    });
  } catch (error: any) {
    console.error("Error fetching low stock items:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch low stock items",
    });
  }
};

/**
 * Get inventory value summary
 */
export const getInventoryValueSummary = async (
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

    const summary = await inventoryService.getInventoryValueSummary(outletId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error("Error fetching inventory value summary:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch inventory value summary",
    });
  }
};

/**
 * Get restock history for item
 */
export const getRestockHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const history = await inventoryService.getRestockHistory(
      id,
      outletId,
      limit
    );

    res.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error("Error fetching restock history:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch restock history",
    });
  }
};

/**
 * Get inventory categories
 */
export const getInventoryCategories = async (
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

    const categories = await inventoryService.getInventoryCategories(outletId);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.error("Error fetching inventory categories:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch inventory categories",
    });
  }
};

/**
 * Get stock movement report
 */
export const getStockMovementReport = async (
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

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
      return;
    }

    const report = await inventoryService.getStockMovementReport(
      outletId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error fetching stock movement report:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch stock movement report",
    });
  }
};

/**
 * Bulk update stock levels
 */
export const bulkUpdateStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const userId = req.user?.userId;
    const { updates } = req.body;

    if (!outletId || !userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({
        success: false,
        message: "Updates array is required",
      });
      return;
    }

    const results = await inventoryService.bulkUpdateStock(
      outletId,
      updates,
      userId
    );

    res.json({
      success: true,
      message: "Bulk update completed",
      data: results,
    });
  } catch (error: any) {
    console.error("Error bulk updating stock:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to bulk update stock",
    });
  }
};
