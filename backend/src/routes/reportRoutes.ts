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

// All routes require authentication and current outlet
router.use(authenticate);
router.use(attachCurrentOutlet);

// Report routes
router.get("/dashboard", getDashboardStats);
router.get("/sales", getSalesReport);
router.get("/items", getItemSalesReport);
router.get("/categories", getCategorySalesReport);
router.get("/payment-methods", getPaymentMethodReport);
router.get("/top-items", getTopSellingItems);
router.get("/customers", getCustomerAnalytics);
router.get("/menu-print", getMenuPrintData);
router.get("/menu-full", getFullMenuData);

export default router;
