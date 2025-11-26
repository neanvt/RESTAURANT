import { Router } from "express";
import {
  sendOTP,
  verifyOTP,
  refreshToken,
  logout,
  getCurrentUser,
  register,
  login,
  setPassword,
  changePassword,
} from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";
import { otpRateLimiter, authRateLimiter } from "../middleware/rateLimiter";

const router = Router();

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to phone number
 * @access  Public
 */
router.post("/send-otp", otpRateLimiter, sendOTP);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and login/register user
 * @access  Public
 */
router.post("/verify-otp", authRateLimiter, verifyOTP);

/**
 * @route   POST /api/auth/register
 * @desc    Register user (without OTP)
 * @access  Public
 */
router.post("/register", authRateLimiter, register);
/**
 * @route   POST /api/auth/login
 * @desc    Login with email/phone + password
 * @access  Public
 */
router.post("/login", authRateLimiter, login);

/**
 * @route   POST /api/auth/set-password
 * @desc    Set password for a user after verifying OTP (idToken)
 * @access  Public
 */
router.post("/set-password", authRateLimiter, setPassword);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password with old password verification
 * @access  Protected
 */
router.post("/change-password", authenticate, changePassword);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh", authRateLimiter, refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Protected
 */
router.post("/logout", authenticate, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user details
 * @access  Protected
 */
router.get("/me", authenticate, getCurrentUser);

export default router;
