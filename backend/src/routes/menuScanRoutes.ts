import express from "express";
import {
  scanMenu,
  validateScannedItems,
  bulkImportItems,
  suggestCategory,
  extractPrice,
} from "../controllers/menuScanController";
import { authenticate } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = express.Router();

// Apply authentication and outlet validation to all routes
router.use(authenticate);
router.use(attachCurrentOutlet);

// Menu scanning routes
router.post("/scan", scanMenu);
router.post("/validate", validateScannedItems);
router.post("/import", bulkImportItems);
router.post("/suggest-category", suggestCategory);
router.post("/extract-price", extractPrice);

export default router;
