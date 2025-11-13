import express from "express";
import {
  getKOTs,
  getKOT,
  updateKOTItemStatus,
  updateKOTStatus,
  getKOTsByOrder,
  printKOT,
} from "../controllers/kotController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = express.Router();

// All routes require authentication and current outlet
router.use(authenticate);
// Allow only staff roles that should access KOTs (kitchen staff, waiters, staff, admins)
router.use(
  authorize("primary_admin", "secondary_admin", "staff", "waiter", "kitchen")
);
router.use(attachCurrentOutlet);

// KOT routes
router.get("/", getKOTs);
router.get("/:id", getKOT);
router.post("/:id/print", printKOT);
router.put("/:id/status", updateKOTStatus);
router.put("/:id/items/:itemId/status", updateKOTItemStatus);
router.get("/order/:orderId", getKOTsByOrder);

export default router;
