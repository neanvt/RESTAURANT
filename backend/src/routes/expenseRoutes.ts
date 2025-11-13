import express from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getExpenseTrends,
  getExpenseSuggestions,
} from "../controllers/expenseController";
import { authenticate } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = express.Router();

// Apply authentication and outlet validation to all routes
router.use(authenticate);
router.use(attachCurrentOutlet);

// Expense CRUD routes
router.post("/", createExpense);
router.get("/", getExpenses);
router.get("/summary", getExpenseSummary);
router.get("/trends", getExpenseTrends);
router.get("/suggestions", getExpenseSuggestions);
router.get("/:id", getExpenseById);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
