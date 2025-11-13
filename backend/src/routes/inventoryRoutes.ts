import express from "express";
import {
  createInventoryItem,
  getInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
  restockItem,
  useStock,
  getLowStockItems,
  getInventoryValueSummary,
  getRestockHistory,
  getInventoryCategories,
  getStockMovementReport,
  bulkUpdateStock,
} from "../controllers/inventoryController";
import { authenticate } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = express.Router();

// Apply authentication and outlet validation to all routes
router.use(authenticate);
router.use(attachCurrentOutlet);

// Inventory CRUD routes
router.post("/", createInventoryItem);
router.get("/", getInventoryItems);
router.get("/low-stock", getLowStockItems);
router.get("/value-summary", getInventoryValueSummary);
router.get("/categories", getInventoryCategories);
router.get("/stock-movement", getStockMovementReport);
router.post("/bulk-update", bulkUpdateStock);
router.get("/:id", getInventoryItemById);
router.put("/:id", updateInventoryItem);
router.delete("/:id", deleteInventoryItem);

// Stock management routes
router.post("/:id/restock", restockItem);
router.post("/:id/use", useStock);
router.get("/:id/restock-history", getRestockHistory);

export default router;
