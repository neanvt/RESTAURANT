import express from "express";
import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  searchByPhone,
  getCustomerStats,
} from "../controllers/customerController";
import { authenticate } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = express.Router();

// All routes require authentication and current outlet
router.use(authenticate);
router.use(attachCurrentOutlet);

// Customer routes
router.post("/", createCustomer);
router.get("/", getCustomers);
router.get("/stats", getCustomerStats);
router.get("/search", searchByPhone);
router.get("/:id", getCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
