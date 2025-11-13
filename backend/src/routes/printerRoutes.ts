import express from "express";
import {
  createPrinter,
  getPrinters,
  getPrinterById,
  updatePrinter,
  deletePrinter,
  updatePrinterStatus,
  setDefaultPrinter,
  createPrintJob,
  getPrintJobs,
  updatePrintJobStatus,
  retryPrintJob,
  cancelPrintJob,
  checkPrinterConnectivity,
} from "../controllers/printerController";
import { authenticate } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = express.Router();

// Apply authentication and outlet validation to all routes
router.use(authenticate);
router.use(attachCurrentOutlet);

// Printer CRUD routes
router.post("/", createPrinter);
router.get("/", getPrinters);
router.get("/connectivity", checkPrinterConnectivity);
router.get("/:id", getPrinterById);
router.put("/:id", updatePrinter);
router.delete("/:id", deletePrinter);

// Printer management routes
router.patch("/:id/status", updatePrinterStatus);
router.patch("/:id/set-default", setDefaultPrinter);

// Print job routes
router.post("/jobs", createPrintJob);
router.get("/jobs", getPrintJobs);
router.patch("/jobs/:id/status", updatePrintJobStatus);
router.post("/jobs/:id/retry", retryPrintJob);
router.post("/jobs/:id/cancel", cancelPrintJob);

export default router;
