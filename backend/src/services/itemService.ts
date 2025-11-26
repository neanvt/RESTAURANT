import Item, { IItem } from "../models/Item";
import Category from "../models/Category";
import mongoose from "mongoose";
import logger from "../utils/logger";
import { queueAIImageGeneration } from "../jobs/aiImageJob";
import aiImageService from "./aiImageService";

export interface CreateItemDTO {
  outletId: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image?: {
    url?: string;
    isAiGenerated?: boolean;
    aiPrompt?: string;
  };
  tax?: {
    isApplicable: boolean;
    rate: number;
    type: "percentage" | "fixed";
  };
  isFavourite?: boolean;
  isAvailable?: boolean;
  inventory?: {
    trackInventory: boolean;
    currentStock: number;
    lowStockAlert: number;
  };
}

export interface UpdateItemDTO extends Partial<CreateItemDTO> {}

export interface ItemFilters {
  outletId: string;
  category?: string;
  isFavourite?: boolean;
  isAvailable?: boolean;
  search?: string;
  isActive?: boolean;
}

class ItemService {
  /**
   * Create a new item
   */
  async createItem(data: CreateItemDTO): Promise<IItem> {
    try {
      // Verify category exists and belongs to the outlet
      const category = await Category.findOne({
        _id: data.category,
        outletId: data.outletId,
        isActive: true,
      });

      if (!category) {
        throw new Error("Category not found or does not belong to this outlet");
      }

      // Create item
      const item = new Item({
        ...data,
        image: data.image || {
          url: undefined,
          isAiGenerated: false,
          aiPrompt: undefined,
        },
        tax: data.tax || {
          isApplicable: false,
          rate: 0,
          type: "percentage",
        },
        inventory: data.inventory || {
          trackInventory: false,
          currentStock: 0,
          lowStockAlert: 10,
        },
      });

      await item.save();

      logger.info(`Item created: ${item._id}`);

      return item;
    } catch (error: any) {
      logger.error("Error creating item:", error);
      throw new Error(error.message || "Failed to create item");
    }
  }

  /**
   * Get all items with filters
   */
  async getItems(filters: ItemFilters): Promise<IItem[]> {
    try {
      const query: any = {
        outletId: filters.outletId,
        isActive: filters.isActive !== undefined ? filters.isActive : true,
      };

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.isFavourite !== undefined) {
        query.isFavourite = filters.isFavourite;
      }

      if (filters.isAvailable !== undefined) {
        query.isAvailable = filters.isAvailable;
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      const items = await Item.find(query)
        .populate("category", "name icon")
        .sort({ createdAt: -1 });

      return items;
    } catch (error: any) {
      logger.error("Error fetching items:", error);
      throw new Error("Failed to fetch items");
    }
  }

  /**
   * Get item by ID
   */
  async getItemById(itemId: string, outletId: string): Promise<IItem | null> {
    try {
      const item = await Item.findOne({
        _id: itemId,
        outletId,
        isActive: true,
      }).populate("category", "name icon");

      return item;
    } catch (error: any) {
      logger.error("Error fetching item:", error);
      throw new Error("Failed to fetch item");
    }
  }

  /**
   * Update item
   */
  async updateItem(
    itemId: string,
    outletId: string,
    data: UpdateItemDTO
  ): Promise<IItem | null> {
    try {
      // Verify item exists and belongs to outlet
      const item = await Item.findOne({
        _id: itemId,
        outletId,
        isActive: true,
      });

      if (!item) {
        throw new Error("Item not found or does not belong to this outlet");
      }

      // If category is being updated, verify it exists
      if (data.category) {
        const category = await Category.findOne({
          _id: data.category,
          outletId,
          isActive: true,
        });

        if (!category) {
          throw new Error(
            "Category not found or does not belong to this outlet"
          );
        }
      }

      // Update item fields
      Object.assign(item, data);

      await item.save();

      logger.info(`Item updated: ${itemId}`);

      return item;
    } catch (error: any) {
      logger.error("Error updating item:", error);
      throw new Error(error.message || "Failed to update item");
    }
  }

  /**
   * Delete item (soft delete)
   */
  async deleteItem(itemId: string, outletId: string): Promise<boolean> {
    try {
      const item = await Item.findOne({
        _id: itemId,
        outletId,
      });

      if (!item) {
        throw new Error("Item not found");
      }

      item.isActive = false;
      await item.save();

      // Delete AI generated image if exists
      if (item.image?.isAiGenerated && item.image?.url) {
        await aiImageService.deleteImage(item.image.url);
      }

      logger.info(`Item deleted: ${itemId}`);

      return true;
    } catch (error: any) {
      logger.error("Error deleting item:", error);
      throw new Error("Failed to delete item");
    }
  }

  /**
   * Toggle favourite status
   */
  async toggleFavourite(
    itemId: string,
    outletId: string
  ): Promise<IItem | null> {
    try {
      const item = await Item.findOne({
        _id: itemId,
        outletId,
        isActive: true,
      });

      if (!item) {
        throw new Error("Item not found");
      }

      item.isFavourite = !item.isFavourite;
      await item.save();

      logger.info(`Item favourite toggled: ${itemId} -> ${item.isFavourite}`);

      return item;
    } catch (error: any) {
      logger.error("Error toggling favourite:", error);
      throw new Error("Failed to toggle favourite");
    }
  }

  /**
   * Toggle availability status
   */
  async toggleAvailability(
    itemId: string,
    outletId: string
  ): Promise<IItem | null> {
    try {
      const item = await Item.findOne({
        _id: itemId,
        outletId,
        isActive: true,
      });

      if (!item) {
        throw new Error("Item not found");
      }

      item.isAvailable = !item.isAvailable;
      await item.save();

      logger.info(
        `Item availability toggled: ${itemId} -> ${item.isAvailable}`
      );

      return item;
    } catch (error: any) {
      logger.error("Error toggling availability:", error);
      throw new Error("Failed to toggle availability");
    }
  }

  /**
   * Generate AI image for item (queued)
   */
  async generateAIImage(
    itemId: string,
    outletId: string,
    prompt?: string
  ): Promise<{ jobId: string; message: string }> {
    try {
      const item = await Item.findOne({
        _id: itemId,
        outletId,
        isActive: true,
      }).populate("category", "name");

      if (!item) {
        throw new Error("Item not found");
      }

      // Use provided prompt or generate from item details
      const finalPrompt = prompt || item.name;
      const category = item.category as any;
      const categoryName = category?.name;

      // Queue the image generation job
      const job = await queueAIImageGeneration({
        itemId: itemId,
        prompt: finalPrompt,
        categoryName,
        description: item.description,
      });

      logger.info(
        `AI image generation queued for item ${itemId}, job: ${job.id}`
      );

      return {
        jobId: job.id?.toString() || "",
        message: "AI image generation queued successfully",
      };
    } catch (error: any) {
      logger.error("Error queueing AI image generation:", error);
      throw new Error(error.message || "Failed to queue AI image generation");
    }
  }

  /**
   * Generate AI image synchronously (for immediate results)
   */
  async generateAIImageSync(
    itemId: string,
    outletId: string,
    prompt?: string
  ): Promise<IItem> {
    try {
      if (!aiImageService.isConfigured()) {
        throw new Error(
          "AI image generation is not configured. Please set OPENAI_API_KEY."
        );
      }

      const item = await Item.findOne({
        _id: itemId,
        outletId,
        isActive: true,
      }).populate("category", "name");

      if (!item) {
        throw new Error("Item not found");
      }

      // Use provided prompt or generate from item details
      const finalPrompt = prompt || item.name;
      const category = item.category as any;
      const categoryName = category?.name;

      // Generate image
      const generatedImage = await aiImageService.generateItemImage(
        finalPrompt,
        categoryName,
        item.description
      );

      // Delete old AI image if exists
      if (item.image?.isAiGenerated && item.image?.url) {
        await aiImageService.deleteImage(item.image.url);
      }

      // Update item with new image
      item.image = {
        url: generatedImage.localPath,
        isAiGenerated: true,
        aiPrompt: generatedImage.prompt,
      };

      await item.save();

      logger.info(`AI image generated and updated for item ${itemId}`);

      return item;
    } catch (error: any) {
      logger.error("Error generating AI image:", error);
      throw new Error(error.message || "Failed to generate AI image");
    }
  }

  /**
   * Update inventory stock
   */
  async updateStock(
    itemId: string,
    outletId: string,
    quantity: number,
    operation: "add" | "subtract" | "set"
  ): Promise<IItem | null> {
    try {
      const item = await Item.findOne({
        _id: itemId,
        outletId,
        isActive: true,
      });

      if (!item) {
        throw new Error("Item not found");
      }

      if (!item.inventory.trackInventory) {
        throw new Error("Inventory tracking is not enabled for this item");
      }

      switch (operation) {
        case "add":
          item.inventory.currentStock += quantity;
          break;
        case "subtract":
          item.inventory.currentStock = Math.max(
            0,
            item.inventory.currentStock - quantity
          );
          break;
        case "set":
          item.inventory.currentStock = Math.max(0, quantity);
          break;
      }

      await item.save();

      logger.info(
        `Stock updated for item ${itemId}: ${item.inventory.currentStock}`
      );

      return item;
    } catch (error: any) {
      logger.error("Error updating stock:", error);
      throw new Error(error.message || "Failed to update stock");
    }
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(outletId: string): Promise<IItem[]> {
    try {
      const items = await Item.aggregate([
        {
          $match: {
            outletId: new mongoose.Types.ObjectId(outletId),
            isActive: true,
            "inventory.trackInventory": true,
          },
        },
        {
          $addFields: {
            isLowStock: {
              $lte: ["$inventory.currentStock", "$inventory.lowStockAlert"],
            },
          },
        },
        {
          $match: {
            isLowStock: true,
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: "$category",
        },
        {
          $sort: {
            "inventory.currentStock": 1,
          },
        },
      ]);

      return items as IItem[];
    } catch (error: any) {
      logger.error("Error fetching low stock items:", error);
      throw new Error("Failed to fetch low stock items");
    }
  }

  /**
   * Get items by category
   */
  async getItemsByCategory(
    outletId: string,
    categoryId: string
  ): Promise<IItem[]> {
    try {
      const items = await Item.find({
        outletId,
        category: categoryId,
        isActive: true,
      }).sort({ name: 1 });

      return items;
    } catch (error: any) {
      logger.error("Error fetching items by category:", error);
      throw new Error("Failed to fetch items by category");
    }
  }

  /**
   * Get items with popularity data (sorted by order frequency)
   */
  async getItemsWithPopularity(filters: ItemFilters): Promise<IItem[]> {
    try {
      // Build base query for items
      const query: any = {
        outletId: new mongoose.Types.ObjectId(filters.outletId),
        isActive: filters.isActive !== undefined ? filters.isActive : true,
      };

      if (filters.category) {
        query.category = new mongoose.Types.ObjectId(filters.category);
      }

      if (filters.isFavourite !== undefined) {
        query.isFavourite = filters.isFavourite;
      }

      if (filters.isAvailable !== undefined) {
        query.isAvailable = filters.isAvailable;
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      // Calculate date ranges for popularity
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get items with popularity data using aggregation pipeline
      const itemsWithPopularity = await Item.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'orders',
            let: { itemId: '$_id', outletId: '$outletId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$outletId', '$$outletId'] },
                      { $in: ['$$itemId', '$items.item'] },
                      { $gte: ['$createdAt', last30Days] },
                      { $ne: ['$status', 'cancelled'] }
                    ]
                  }
                }
              },
              { $unwind: '$items' },
              {
                $match: {
                  $expr: { $eq: ['$items.item', '$$itemId'] }
                }
              },
              {
                $group: {
                  _id: null,
                  todayCount: {
                    $sum: {
                      $cond: [
                        { $gte: ['$createdAt', today] },
                        '$items.quantity',
                        0
                      ]
                    }
                  },
                  last7DaysCount: {
                    $sum: {
                      $cond: [
                        { $gte: ['$createdAt', last7Days] },
                        '$items.quantity',
                        0
                      ]
                    }
                  },
                  last30DaysCount: {
                    $sum: '$items.quantity'
                  }
                }
              }
            ],
            as: 'popularity'
          }
        },
        {
          $addFields: {
            popularityData: {
              $ifNull: [{ $arrayElemAt: ['$popularity', 0] }, {
                todayCount: 0,
                last7DaysCount: 0,
                last30DaysCount: 0
              }]
            }
          }
        },
        {
          $addFields: {
            todayCount: '$popularityData.todayCount',
            last7DaysCount: '$popularityData.last7DaysCount',
            last30DaysCount: '$popularityData.last30DaysCount',
            // Create a composite sort score: today * 1000 + last7Days * 100 + last30Days * 10
            popularityScore: {
              $add: [
                { $multiply: ['$popularityData.todayCount', 1000] },
                { $multiply: ['$popularityData.last7DaysCount', 100] },
                { $multiply: ['$popularityData.last30DaysCount', 10] }
              ]
            }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $sort: {
            popularityScore: -1,  // Higher popularity first
            name: 1              // Then alphabetical
          }
        },
        {
          $project: {
            popularity: 0,
            popularityData: 0,
            popularityScore: 0
          }
        }
      ]);

      logger.info(`Fetched ${itemsWithPopularity.length} items with popularity data`);
      
      return itemsWithPopularity as IItem[];
    } catch (error: any) {
      logger.error("Error fetching items with popularity:", error);
      // Fallback to regular items fetch if popularity calculation fails
      return this.getItems(filters);
    }
  }
}

export default new ItemService();
