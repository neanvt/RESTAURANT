import express from "express";
import subscriptionController from "../controllers/subscriptionController";
import { authenticate } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = express.Router();

// Apply authentication and outlet middleware to all routes
router.use(authenticate);
router.use(attachCurrentOutlet);

/**
 * @route   GET /api/subscriptions
 * @desc    Get current outlet's subscription
 * @access  Private
 */
router.get("/", subscriptionController.getSubscription);

/**
 * @route   POST /api/subscriptions
 * @desc    Create subscription (usually automatic on outlet creation)
 * @access  Private
 */
router.post("/", subscriptionController.createSubscription);

/**
 * @route   PUT /api/subscriptions/upgrade
 * @desc    Upgrade subscription tier
 * @access  Private
 */
router.put("/upgrade", subscriptionController.upgradeTier);

/**
 * @route   PUT /api/subscriptions/downgrade
 * @desc    Downgrade subscription tier
 * @access  Private
 */
router.put("/downgrade", subscriptionController.downgradeTier);

/**
 * @route   PUT /api/subscriptions/cancel
 * @desc    Cancel subscription
 * @access  Private
 */
router.put("/cancel", subscriptionController.cancelSubscription);

/**
 * @route   PUT /api/subscriptions/reactivate
 * @desc    Reactivate canceled subscription
 * @access  Private
 */
router.put("/reactivate", subscriptionController.reactivateSubscription);

/**
 * @route   GET /api/subscriptions/stats
 * @desc    Get subscription statistics and usage
 * @access  Private
 */
router.get("/stats", subscriptionController.getStats);

/**
 * @route   GET /api/subscriptions/tiers
 * @desc    Get all tier configurations
 * @access  Private
 */
router.get("/tiers", subscriptionController.getTierConfigurations);

/**
 * @route   GET /api/subscriptions/upgrade-options
 * @desc    Get available upgrade options for current tier
 * @access  Private
 */
router.get("/upgrade-options", subscriptionController.getUpgradeOptions);

/**
 * @route   GET /api/subscriptions/feature/:feature
 * @desc    Check if a feature is available
 * @access  Private
 */
router.get("/feature/:feature", subscriptionController.checkFeature);

/**
 * @route   GET /api/subscriptions/quota/:metric
 * @desc    Get remaining quota for a metric
 * @access  Private
 */
router.get("/quota/:metric", subscriptionController.getRemainingQuota);

/**
 * @route   POST /api/subscriptions/sync-usage
 * @desc    Sync usage from database
 * @access  Private
 */
router.post("/sync-usage", subscriptionController.syncUsage);

export default router;
