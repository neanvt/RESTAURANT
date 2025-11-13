import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoice,
  updatePaymentStatus,
  getInvoiceByOrder,
  getSalesSummary,
  printInvoice,
} from "../controllers/invoiceController";
import { authenticate } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = express.Router();

// All routes require authentication and current outlet
router.use(authenticate);
router.use(attachCurrentOutlet);

// Invoice routes
router.post("/", createInvoice);
router.get("/", getInvoices);
router.get("/summary", getSalesSummary);
router.get("/:id", getInvoice);
router.post("/:id/print", printInvoice);
router.put("/:id/payment", updatePaymentStatus);
router.get("/order/:orderId", getInvoiceByOrder);

export default router;
