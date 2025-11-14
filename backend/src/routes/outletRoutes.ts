import { Router } from "express";
import {
  getAllOutlets,
  createOutlet,
  getOutletById,
  updateOutlet,
  deleteOutlet,
  selectOutlet,
  uploadOutletLogo,
  deleteOutletLogo,
  getCurrentOutlet,
  getOutletStats,
} from "../controllers/outletController";
import { authenticate } from "../middleware/authMiddleware";
import { verifyOutletAccess } from "../middleware/outletMiddleware";
import { cloudinaryUpload } from "../middleware/cloudinaryUpload";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/outlets
 * @desc    Get all outlets for authenticated user
 * @access  Private
 */
router.get("/", getAllOutlets);

/**
 * @route   POST /api/outlets
 * @desc    Create a new outlet
 * @access  Private
 */
router.post("/", createOutlet);

/**
 * @route   GET /api/outlets/current
 * @desc    Get current selected outlet
 * @access  Private
 */
router.get("/current", getCurrentOutlet);

/**
 * @route   GET /api/outlets/:id
 * @desc    Get outlet by ID
 * @access  Private (owner only)
 */
router.get("/:id", getOutletById);

/**
 * @route   PUT /api/outlets/:id
 * @desc    Update outlet
 * @access  Private (owner only)
 */
router.put("/:id", updateOutlet);

/**
 * @route   DELETE /api/outlets/:id
 * @desc    Delete outlet (soft delete)
 * @access  Private (owner only)
 */
router.delete("/:id", deleteOutlet);

/**
 * @route   POST /api/outlets/:id/select
 * @desc    Select outlet as current
 * @access  Private (owner only)
 */
router.post("/:id/select", selectOutlet);

/**
 * @route   PUT /api/outlets/:id/logo
 * @desc    Upload outlet logo
 * @access  Private (owner only)
 */
router.put("/:id/logo", cloudinaryUpload.single("logo"), uploadOutletLogo);

/**
 * @route   DELETE /api/outlets/:id/logo
 * @desc    Delete outlet logo
 * @access  Private (owner only)
 */
router.delete("/:id/logo", deleteOutletLogo);

/**
 * @route   GET /api/outlets/:id/stats
 * @desc    Get outlet statistics
 * @access  Private (owner only)
 */
router.get("/:id/stats", verifyOutletAccess, getOutletStats);

export default router;
