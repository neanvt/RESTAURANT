import express from "express";
import {
  getDashboardStats,
  getSalesReport,
  getItemSalesReport,
  getCategorySalesReport,
  getPaymentMethodReport,
  getTopSellingItems,
  getCustomerAnalytics,
  getMenuPrintData,
  getFullMenuData,
} from "../controllers/reportController";
import { authenticate } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = express.Router();

// Public menu routes (no authentication required, expects outletId in query)
router.get("/menu-current", getMenuPrintData);
router.get("/menu-public", getFullMenuData);

// All other routes require authentication and current outlet
router.use(authenticate);
router.use(attachCurrentOutlet);

// Protected report routes
router.get("/dashboard", getDashboardStats);
router.get("/sales", getSalesReport);
router.get("/items", getItemSalesReport);
router.get("/categories", getCategorySalesReport);
router.get("/payment-methods", getPaymentMethodReport);
router.get("/top-items", getTopSellingItems);
router.get("/customers", getCustomerAnalytics);

// Authenticated menu routes (gets outlet from middleware)
router.get("/menu-print", getMenuPrintData);
router.get("/menu-full", getFullMenuData);

export default router;
