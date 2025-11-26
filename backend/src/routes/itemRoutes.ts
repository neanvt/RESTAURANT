import { Router } from "express";
import {
  getItems,
  getItemsWithPopularity,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  uploadItemImage,
  toggleFavourite,
  toggleAvailability,
  updateStock,
  getLowStockItems,
} from "../controllers/itemController";
import { authenticate } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = Router();

// All routes require authentication and outlet selection
router.use(authenticate);
router.use(attachCurrentOutlet);

/**
 * @route   GET /api/items
 * @desc    Get all items with filters
 * @access  Private
 * @query   category, isFavourite, isAvailable, search
 */
router.get("/", getItems);

/**
 * @route   GET /api/items/with-popularity
 * @desc    Get all items sorted by order popularity (today/7days/30days) then alphabetically
 * @access  Private
 * @query   category, isFavourite, isAvailable, search
 */
router.get("/with-popularity", getItemsWithPopularity);

/**
 * @route   GET /api/items/low-stock
 * @desc    Get low stock items
 * @access  Private
 */
router.get("/low-stock", getLowStockItems);

/**
 * @route   GET /api/items/:id
 * @desc    Get item by ID
 * @access  Private
 */
router.get("/:id", getItemById);

/**
 * @route   POST /api/items
 * @desc    Create new item
 * @access  Private
 */
router.post("/", createItem);

/**
 * @route   PUT /api/items/:id
 * @desc    Update item
 * @access  Private
 */
router.put("/:id", updateItem);

/**
 * @route   DELETE /api/items/:id
 * @desc    Delete item
 * @access  Private
 */
router.delete("/:id", deleteItem);

/**
 * @route   POST /api/items/:id/image
 * @desc    Upload item image
 * @access  Private
 */
router.post("/:id/image", uploadItemImage);

// AI image generation endpoint removed

/**
 * @route   PUT /api/items/:id/toggle-favourite
 * @desc    Toggle item favourite status
 * @access  Private
 */
router.put("/:id/toggle-favourite", toggleFavourite);

/**
 * @route   PUT /api/items/:id/toggle-availability
 * @desc    Toggle item availability
 * @access  Private
 */
router.put("/:id/toggle-availability", toggleAvailability);

/**
 * @route   PUT /api/items/:id/stock
 * @desc    Update item stock
 * @access  Private
 */
router.put("/:id/stock", updateStock);

export default router;
