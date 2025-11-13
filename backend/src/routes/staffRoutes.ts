import { Router } from "express";
import staffController from "../controllers/staffController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { attachCurrentOutlet } from "../middleware/outletMiddleware";

const router = Router();

// All routes require authentication and outlet selection
router.use(authenticate);
router.use(attachCurrentOutlet);

/**
 * @route   GET /api/staff
 * @desc    Get all staff for current outlet
 * @access  Private (Admin, Secondary Admin)
 */
router.get(
  "/",
  authorize("primary_admin", "secondary_admin"),
  staffController.getStaff
);

/**
 * @route   GET /api/staff/activity
 * @desc    Get staff activity log
 * @access  Private (Admin, Secondary Admin)
 */
router.get(
  "/activity",
  authorize("primary_admin", "secondary_admin"),
  staffController.getStaffActivity
);

/**
 * @route   GET /api/staff/:id
 * @desc    Get staff member by ID
 * @access  Private (Admin, Secondary Admin)
 */
router.get(
  "/:id",
  authorize("primary_admin", "secondary_admin"),
  staffController.getStaffById
);

/**
 * @route   GET /api/staff/:id/activity
 * @desc    Get staff member's activity
 * @access  Private (Admin, Secondary Admin)
 */
router.get(
  "/:id/activity",
  authorize("primary_admin", "secondary_admin"),
  staffController.getStaffMemberActivity
);

/**
 * @route   POST /api/staff/invite
 * @desc    Invite new staff member
 * @access  Private (Admin, Secondary Admin)
 */
router.post(
  "/invite",
  authorize("primary_admin", "secondary_admin"),
  staffController.inviteStaff
);

/**
 * @route   PUT /api/staff/:id
 * @desc    Update staff member
 * @access  Private (Admin, Secondary Admin)
 */
router.put(
  "/:id",
  authorize("primary_admin", "secondary_admin"),
  staffController.updateStaff
);

/**
 * @route   DELETE /api/staff/:id
 * @desc    Remove staff member from outlet
 * @access  Private (Primary Admin only)
 */
router.delete("/:id", authorize("primary_admin"), staffController.removeStaff);

export default router;
