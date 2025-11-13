import { Router } from "express";
import notificationController from "../controllers/notificationController";
import { authenticate } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = Router();

// All routes require authentication and outlet selection
router.use(authenticate);
router.use(attachCurrentOutlet);

// Subscribe/Unsubscribe
router.post("/subscribe", notificationController.subscribe);
router.post("/unsubscribe", notificationController.unsubscribe);

// Preferences
router.get("/preferences", notificationController.getPreferences);
router.put("/preferences", notificationController.updatePreferences);

export default router;
