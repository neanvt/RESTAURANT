import express from "express";
import {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  deleteFeedback,
} from "../controllers/feedbackController";
import { authenticate } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = express.Router();

// Public route for customer feedback submission (no auth required)
router.post("/public", createFeedback);

// Protected routes require authentication and outlet selection
router.use(authenticate);
router.use(attachCurrentOutlet);

router.post("/", createFeedback);
router.get("/", getFeedbacks);
router.get("/:id", getFeedbackById);
router.delete("/:id", deleteFeedback);

export default router;
