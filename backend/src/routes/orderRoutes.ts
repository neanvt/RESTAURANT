import express from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  generateKOT,
  holdOrder,
  resumeOrder,
  cancelOrder,
  completeOrder,
  deleteOrder,
} from "../controllers/orderController";
import { authenticate } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = express.Router();

// All routes require authentication and current outlet
router.use(authenticate);
router.use(attachCurrentOutlet);

// Order routes
router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrder);
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

// Order action routes
router.post("/:id/generate-kot", generateKOT);
router.put("/:id/hold", holdOrder);
router.put("/:id/resume", resumeOrder);
router.put("/:id/cancel", cancelOrder);
router.put("/:id/complete", completeOrder);

export default router;
