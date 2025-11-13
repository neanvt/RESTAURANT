import { Request, Response } from "express";
import menuScanService from "../services/menuScanService";

/**
 * Scan menu image using AI
 */
export const scanMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { imageUrl } = req.body;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!imageUrl) {
      res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
      return;
    }

    const result = await menuScanService.scanMenuImage(imageUrl, outletId);

    res.json({
      success: true,
      message: "Menu scanned successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error scanning menu:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to scan menu",
    });
  }
};

/**
 * Validate scanned items
 */
export const validateScannedItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { items } = req.body;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!Array.isArray(items)) {
      res.status(400).json({
        success: false,
        message: "Items array is required",
      });
      return;
    }

    const result = await menuScanService.validateScannedItems(items, outletId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error validating items:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to validate items",
    });
  }
};

/**
 * Bulk import scanned items
 */
export const bulkImportItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const userId = req.user?.userId;
    const { items, createCategories, skipDuplicates } = req.body;

    if (!outletId || !userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: "Items array is required and cannot be empty",
      });
      return;
    }

    const result = await menuScanService.bulkImportItems(
      items,
      outletId,
      userId,
      {
        createCategories,
        skipDuplicates,
      }
    );

    res.json({
      success: true,
      message: `Successfully imported ${result.imported.length} items`,
      data: result,
    });
  } catch (error: any) {
    console.error("Error bulk importing items:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to import items",
    });
  }
};

/**
 * Suggest category for an item
 */
export const suggestCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = (req as any).outletId;
    const { itemName } = req.body;

    if (!outletId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!itemName) {
      res.status(400).json({
        success: false,
        message: "Item name is required",
      });
      return;
    }

    const category = await menuScanService.suggestCategory(itemName, outletId);

    res.json({
      success: true,
      data: { category },
    });
  } catch (error: any) {
    console.error("Error suggesting category:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to suggest category",
    });
  }
};

/**
 * Extract price from text
 */
export const extractPrice = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({
        success: false,
        message: "Text is required",
      });
      return;
    }

    const price = await menuScanService.extractPriceFromText(text);

    res.json({
      success: true,
      data: { price },
    });
  } catch (error: any) {
    console.error("Error extracting price:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to extract price",
    });
  }
};
