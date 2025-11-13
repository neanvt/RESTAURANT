import { Router } from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "../controllers/categoryController";
import { authenticate } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = Router();

// All routes require authentication and outlet selection
router.use(authenticate);
router.use(attachCurrentOutlet);

/**
 * @route   GET /api/categories
 * @desc    Get all categories for current outlet
 * @access  Private
 */
router.get("/", getCategories);

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private
 */
router.post("/", createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private
 */
router.put("/:id", updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private
 */
router.delete("/:id", deleteCategory);

/**
 * @route   PUT /api/categories/reorder
 * @desc    Reorder categories
 * @access  Private
 */
router.put("/reorder", reorderCategories);

export default router;
