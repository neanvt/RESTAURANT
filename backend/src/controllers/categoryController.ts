import { Request, Response } from "express";
import categoryService from "../services/categoryService";
import logger from "../utils/logger";

/**
 * Get all categories
 */
export const getCategories = async (
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

    const categories = await categoryService.getCategories(outletId);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    logger.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_ERROR",
        message: error.message || "Failed to fetch categories",
      },
    });
  }
};

/**
 * Create a new category
 */
export const createCategory = async (
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

    const { name, icon, displayOrder } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Category name is required",
        },
      });
      return;
    }

    const category = await categoryService.createCategory({
      outletId,
      name,
      icon,
      displayOrder,
    });

    res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  } catch (error: any) {
    logger.error("Create category error:", error);
    res.status(400).json({
      success: false,
      error: {
        code: "CREATE_ERROR",
        message: error.message || "Failed to create category",
      },
    });
  }
};

/**
 * Update category
 */
export const updateCategory = async (
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

    const { name, icon, displayOrder } = req.body;

    const category = await categoryService.updateCategory(id, outletId, {
      name,
      icon,
      displayOrder,
    });

    if (!category) {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Category not found",
        },
      });
      return;
    }

    res.json({
      success: true,
      data: category,
      message: "Category updated successfully",
    });
  } catch (error: any) {
    logger.error("Update category error:", error);
    res.status(400).json({
      success: false,
      error: {
        code: "UPDATE_ERROR",
        message: error.message || "Failed to update category",
      },
    });
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (
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

    await categoryService.deleteCategory(id, outletId);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    logger.error("Delete category error:", error);
    res.status(400).json({
      success: false,
      error: {
        code: "DELETE_ERROR",
        message: error.message || "Failed to delete category",
      },
    });
  }
};

/**
 * Reorder categories
 */
export const reorderCategories = async (
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

    const { categories } = req.body;

    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid categories data",
        },
      });
      return;
    }

    const reorderedCategories = await categoryService.reorderCategories(
      outletId,
      categories
    );

    res.json({
      data: reorderedCategories,
      message: "Categories reordered successfully",
    });
  } catch (error: any) {
    logger.error("Reorder categories error:", error);
    res.status(400).json({
      success: false,
      error: {
        code: "REORDER_ERROR",
        message: error.message || "Failed to reorder categories",
      },
    });
  }
};
