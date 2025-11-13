import Category, { ICategory } from "../models/Category";
import logger from "../utils/logger";

export interface CreateCategoryDTO {
  outletId: string;
  name: string;
  icon?: string;
  displayOrder?: number;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

export interface ReorderCategoryDTO {
  categoryId: string;
  newOrder: number;
}

class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryDTO): Promise<ICategory> {
    try {
      // Check if category with same name exists for this outlet
      const existingCategory = await Category.findOne({
        outletId: data.outletId,
        name: data.name,
        isActive: true,
      });

      if (existingCategory) {
        throw new Error("Category with this name already exists");
      }

      const category = new Category(data);
      await category.save();

      logger.info(`Category created: ${category._id}`);

      return category;
    } catch (error: any) {
      logger.error("Error creating category:", error);
      throw new Error(error.message || "Failed to create category");
    }
  }

  /**
   * Get all categories for an outlet
   */
  async getCategories(outletId: string): Promise<ICategory[]> {
    try {
      const categories = await Category.find({
        outletId,
        isActive: true,
      }).sort({ displayOrder: 1 });

      return categories;
    } catch (error: any) {
      logger.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(
    categoryId: string,
    outletId: string
  ): Promise<ICategory | null> {
    try {
      const category = await Category.findOne({
        _id: categoryId,
        outletId,
        isActive: true,
      });

      return category;
    } catch (error: any) {
      logger.error("Error fetching category:", error);
      throw new Error("Failed to fetch category");
    }
  }

  /**
   * Update category
   */
  async updateCategory(
    categoryId: string,
    outletId: string,
    data: UpdateCategoryDTO
  ): Promise<ICategory | null> {
    try {
      const category = await Category.findOne({
        _id: categoryId,
        outletId,
        isActive: true,
      });

      if (!category) {
        throw new Error("Category not found");
      }

      // Check if new name conflicts with existing category
      if (data.name && data.name !== category.name) {
        const existingCategory = await Category.findOne({
          outletId,
          name: data.name,
          isActive: true,
          _id: { $ne: categoryId },
        });

        if (existingCategory) {
          throw new Error("Category with this name already exists");
        }
      }

      Object.assign(category, data);
      await category.save();

      logger.info(`Category updated: ${categoryId}`);

      return category;
    } catch (error: any) {
      logger.error("Error updating category:", error);
      throw new Error(error.message || "Failed to update category");
    }
  }

  /**
   * Delete category (soft delete)
   */
  async deleteCategory(categoryId: string, outletId: string): Promise<boolean> {
    try {
      const category = await Category.findOne({
        _id: categoryId,
        outletId,
      });

      if (!category) {
        throw new Error("Category not found");
      }

      // Check if category has items
      const Item = require("../models/Item").default;
      const itemCount = await Item.countDocuments({
        category: categoryId,
        isActive: true,
      });

      if (itemCount > 0) {
        throw new Error(
          `Cannot delete category with ${itemCount} active items. Please reassign or delete the items first.`
        );
      }

      category.isActive = false;
      await category.save();

      logger.info(`Category deleted: ${categoryId}`);

      return true;
    } catch (error: any) {
      logger.error("Error deleting category:", error);
      throw new Error(error.message || "Failed to delete category");
    }
  }

  /**
   * Reorder categories
   */
  async reorderCategories(
    outletId: string,
    reorderData: ReorderCategoryDTO[]
  ): Promise<ICategory[]> {
    try {
      // Update display order for each category
      const updatePromises = reorderData.map(({ categoryId, newOrder }) =>
        Category.findOneAndUpdate(
          { _id: categoryId, outletId, isActive: true },
          { displayOrder: newOrder },
          { new: true }
        )
      );

      await Promise.all(updatePromises);

      logger.info(`Categories reordered for outlet: ${outletId}`);

      // Return updated categories
      const categories = await this.getCategories(outletId);
      return categories;
    } catch (error: any) {
      logger.error("Error reordering categories:", error);
      throw new Error("Failed to reorder categories");
    }
  }
}

export default new CategoryService();
