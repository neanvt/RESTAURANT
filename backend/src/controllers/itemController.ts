import { Request, Response } from "express";
import itemService from "../services/itemService";
import logger from "../utils/logger";
import {
  cloudinaryUpload,
  uploadAndOptimizeToCloudinary,
  deleteFromCloudinary,
} from "../middleware/cloudinaryUpload";

/**
 * Get all items with filters
 */
export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_OUTLET",
          message: "No outlet selected",
        },
      });
      return;
    }

    const { category, isFavourite, isAvailable, search } = req.query;

    const filters = {
      outletId,
      category: category as string,
      isFavourite: isFavourite === "true" ? true : undefined,
      isAvailable: isAvailable === "true" ? true : undefined,
      search: search as string,
    };

    const items = await itemService.getItems(filters);

    res.json({
      success: true,
      data: items,
    });
  } catch (error: any) {
    logger.error("Get items error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: error.message || "Failed to fetch items",
      },
    });
  }
};

/**
 * Get all items with popularity sorting
 */
export const getItemsWithPopularity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_OUTLET",
          message: "No outlet selected",
        },
      });
      return;
    }

    const { category, isFavourite, isAvailable, search } = req.query;

    const filters = {
      outletId,
      category: category as string,
      isFavourite: isFavourite === "true" ? true : undefined,
      isAvailable: isAvailable === "true" ? true : undefined,
      search: search as string,
    };

    const items = await itemService.getItemsWithPopularity(filters);

    res.json({
      success: true,
      data: items,
    });
  } catch (error: any) {
    logger.error("Get items with popularity error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: error.message || "Failed to fetch items with popularity",
      },
    });
  }
};

/**
 * Get item by ID
 */
export const getItemById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = req.outletId;
    const { id } = req.params;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_OUTLET",
          message: "No outlet selected",
        },
      });
      return;
    }

    const item = await itemService.getItemById(id, outletId);

    if (!item) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Item not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (error: any) {
    logger.error("Get item error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: error.message || "Failed to fetch item",
      },
    });
  }
};

/**
 * Create new item
 */
export const createItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_OUTLET",
          message: "No outlet selected",
        },
      });
      return;
    }

    const {
      name,
      description,
      category,
      price,
      tax,
      isFavourite,
      isAvailable,
      inventory,
    } = req.body;

    if (!name || !category || price === undefined) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Name, category, and price are required",
        },
      });
      return;
    }

    const item = await itemService.createItem({
      outletId,
      name,
      description,
      category,
      price: parseFloat(price),
      tax,
      isFavourite,
      isAvailable,
      inventory,
    });

    res.status(201).json({
      success: true,
      data: item,
      message: "Item created successfully",
    });
  } catch (error: any) {
    logger.error("Create item error:", error);
    res.status(400).json({
      success: false,
      error: {
        code: "CREATE_ERROR",
        message: error.message || "Failed to create item",
      },
    });
  }
};

/**
 * Update item
 */
export const updateItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = req.outletId;
    const { id } = req.params;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_OUTLET",
          message: "No outlet selected",
        },
      });
      return;
    }

    const {
      name,
      description,
      category,
      price,
      tax,
      isFavourite,
      isAvailable,
      inventory,
    } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (tax !== undefined) updateData.tax = tax;
    if (isFavourite !== undefined) updateData.isFavourite = isFavourite;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (inventory !== undefined) updateData.inventory = inventory;

    const item = await itemService.updateItem(id, outletId, updateData);

    if (!item) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Item not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: item,
      message: "Item updated successfully",
    });
  } catch (error: any) {
    logger.error("Update item error:", error);
    res.status(400).json({
      success: false,
      error: {
        code: "UPDATE_ERROR",
        message: error.message || "Failed to update item",
      },
    });
  }
};

/**
 * Delete item
 */
export const deleteItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = req.outletId;
    const { id } = req.params;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_OUTLET",
          message: "No outlet selected",
        },
      });
      return;
    }

    await itemService.deleteItem(id, outletId);

    res.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error: any) {
    logger.error("Delete item error:", error);
    res.status(400).json({
      success: false,
      error: {
        code: "DELETE_ERROR",
        message: error.message || "Failed to delete item",
      },
    });
  }
};

/**
 * Upload item image
 */
export const uploadItemImage = [
  cloudinaryUpload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const outletId = req.outletId;
      const { id } = req.params;

      if (!outletId) {
        res.status(400).json({
          success: false,
          error: {
            code: "NO_OUTLET",
            message: "No outlet selected",
          },
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: {
            code: "NO_FILE",
            message: "No image file provided",
          },
        });
        return;
      }

      // Upload to Cloudinary
      const imageUrl = await uploadAndOptimizeToCloudinary(
        req.file.buffer,
        "items",
        "item"
      );

      // Get existing item to delete old image if exists
      const existingItem = await itemService.getItemById(id, outletId);
      if (existingItem?.image?.url) {
        // Delete old image from Cloudinary
        await deleteFromCloudinary(existingItem.image.url);
      }

      const item = await itemService.updateItem(id, outletId, {
        image: {
          url: imageUrl,
          isAiGenerated: false,
        },
      });

      if (!item) {
        res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Item not found",
          },
        });
        return;
      }

      res.json({
        success: true,
        data: item,
        message: "Image uploaded successfully",
      });
    } catch (error: any) {
      logger.error("Upload image error:", error);
      res.status(400).json({
        success: false,
        error: {
          code: "UPLOAD_ERROR",
          message: error.message || "Failed to upload image",
        },
      });
    }
  },
];

/**
 * Generate AI image for item
 */
// AI generation controller removed per request

/**
 * Toggle favourite status
 */
export const toggleFavourite = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = req.outletId;
    const { id } = req.params;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_OUTLET",
          message: "No outlet selected",
        },
      });
      return;
    }

    const item = await itemService.toggleFavourite(id, outletId);

    if (!item) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Item not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: item,
      message: `Item ${
        item.isFavourite ? "added to" : "removed from"
      } favourites`,
    });
  } catch (error: any) {
    logger.error("Toggle favourite error:", error);
    res.status(400).json({
      success: false,
      error: {
        code: "TOGGLE_ERROR",
        message: error.message || "Failed to toggle favourite",
      },
    });
  }
};

/**
 * Toggle availability status
 */
export const toggleAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = req.outletId;
    const { id } = req.params;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_OUTLET",
          message: "No outlet selected",
        },
      });
      return;
    }

    const item = await itemService.toggleAvailability(id, outletId);

    if (!item) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Item not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: item,
      message: `Item marked as ${
        item.isAvailable ? "available" : "unavailable"
      }`,
    });
  } catch (error: any) {
    logger.error("Toggle availability error:", error);
    res.status(400).json({
      success: false,
      error: {
        code: "TOGGLE_ERROR",
        message: error.message || "Failed to toggle availability",
      },
    });
  }
};

/**
 * Update stock
 */
export const updateStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const outletId = req.outletId;
    const { id } = req.params;
    const { quantity, operation } = req.body;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_OUTLET",
          message: "No outlet selected",
        },
      });
      return;
    }

    if (quantity === undefined || !operation) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Quantity and operation are required",
        },
      });
      return;
    }

    if (!["add", "subtract", "set"].includes(operation)) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Operation must be add, subtract, or set",
        },
      });
      return;
    }

    const item = await itemService.updateStock(
      id,
      outletId,
      parseFloat(quantity),
      operation as "add" | "subtract" | "set"
    );

    if (!item) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Item not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: item,
      message: "Stock updated successfully",
    });
  } catch (error: any) {
    logger.error("Update stock error:", error);
    res.status(400).json({
      success: false,
      error: {
        code: "UPDATE_ERROR",
        message: error.message || "Failed to update stock",
      },
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
    const outletId = req.outletId;

    if (!outletId) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_OUTLET",
          message: "No outlet selected",
        },
      });
      return;
    }

    const items = await itemService.getLowStockItems(outletId);

    res.json({
      success: true,
      data: items,
    });
  } catch (error: any) {
    logger.error("Get low stock items error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: error.message || "Failed to fetch low stock items",
      },
    });
  }
};
