import { Request, Response } from "express";
import authService from "../services/authService";
import User from "../models/User";
import otpService from "../services/otpService";

/**
 * Send OTP to phone number
 * POST /api/auth/send-otp
 */
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;

    // Validate phone number
    if (!phone) {
      res.status(400).json({
        success: false,
        error: {
          code: "PHONE_REQUIRED",
          message: "Phone number is required",
        },
      });
      return;
    }

    if (!authService.validatePhoneNumber(phone)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PHONE",
          message:
            "Invalid phone number format. Please provide a 10-digit Indian phone number.",
        },
      });
      return;
    }

    // Check rate limit
    const rateLimitCheck = await otpService.checkRateLimit(phone);
    if (!rateLimitCheck.allowed) {
      res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message:
            rateLimitCheck.message ||
            "Too many OTP requests. Please try again later.",
        },
      });
      return;
    }

    // Send OTP
    const result = await otpService.sendOTP(phone);

    if (!result.success) {
      res.status(500).json({
        success: false,
        error: {
          code: "OTP_SEND_FAILED",
          message: result.message,
        },
      });
      return;
    }

    // Record OTP attempt for rate limiting
    await otpService.recordOTPAttempt(phone);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: {
        phone,
      },
    });
  } catch (error: any) {
    console.error("Error in sendOTP:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An error occurred while sending OTP",
      },
    });
  }
};

/**
 * Verify OTP and login/register user
 * POST /api/auth/verify-otp
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken, name } = req.body;

    if (!idToken) {
      res.status(400).json({
        success: false,
        error: {
          code: "TOKEN_REQUIRED",
          message: "Firebase ID token is required",
        },
      });
      return;
    }

    // Verify OTP with Firebase
    const verificationResult = await otpService.verifyOTP(idToken);

    if (!verificationResult.success || !verificationResult.phone) {
      res.status(401).json({
        success: false,
        error: {
          code: "VERIFICATION_FAILED",
          message: verificationResult.error || "OTP verification failed",
        },
      });
      return;
    }

    // Find or create user
    const user = await authService.findOrCreateUser(
      verificationResult.phone,
      name
    );

    // Generate tokens
    const tokens = authService.generateTokens(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role,
          outlets: user.outlets,
          currentOutlet: user.currentOutlet,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error: any) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An error occurred during verification",
      },
    });
  }
};

/**
 * Register user without OTP (signup)
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, name, email } = req.body;

    const password = req.body.password as string | undefined;

    if (!phone) {
      res.status(400).json({
        success: false,
        error: { code: "PHONE_REQUIRED", message: "Phone number is required" },
      });
      return;
    }

    if (!authService.validatePhoneNumber(phone)) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_PHONE", message: "Invalid phone number" },
      });
      return;
    }

    if (password && password.length < 6) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PASSWORD",
          message: "Password must be at least 6 characters",
        },
      });
      return;
    }

    // Create user
    try {
      const user = await authService.createUser(phone, name, email, password);
      const tokens = authService.generateTokens(user);

      res.status(201).json({
        success: true,
        message: "User registered",
        data: {
          user: {
            id: user._id,
            phone: user.phone,
            name: user.name,
            email: user.email,
            role: user.role,
            outlets: user.outlets,
            currentOutlet: user.currentOutlet,
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (err: any) {
      res.status(409).json({
        success: false,
        error: { code: "USER_EXISTS", message: err.message || "User exists" },
      });
    }
  } catch (error: any) {
    console.error("Error in register:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An error occurred while registering",
      },
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: {
          code: "TOKEN_REQUIRED",
          message: "Refresh token is required",
        },
      });
      return;
    }

    // Refresh tokens
    const tokens = await authService.refreshTokens(refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error: any) {
    console.error("Error in refreshToken:", error);
    res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: error.message || "Invalid or expired refresh token",
      },
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    // In a production app, you might want to blacklist the token
    // For now, we'll just return success
    // The client will remove the tokens from storage

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    console.error("Error in logout:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An error occurred during logout",
      },
    });
  }
};

/**
 * Get current user details
 * GET /api/auth/me
 */
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // User is attached to request by authMiddleware
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        },
      });
      return;
    }

    const user = await authService.getUserById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role,
          outlets: user.outlets,
          currentOutlet: user.currentOutlet,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error: any) {
    console.error("Error in getCurrentUser:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An error occurred while fetching user details",
      },
    });
  }
};

/**
 * Login with phone/email + password
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body; // identifier: phone or email

    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: "CREDENTIALS_REQUIRED",
          message: "Identifier and password are required",
        },
      });
      return;
    }

    // Find user by phone or email
    let foundUser = await User.findOne({ phone: identifier, isActive: true });
    if (!foundUser) {
      foundUser = await User.findOne({ email: identifier, isActive: true });
    }

    if (!foundUser) {
      res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid identifier or password",
        },
      });
      return;
    }

    if (!foundUser.password) {
      res.status(400).json({
        success: false,
        error: {
          code: "NO_PASSWORD",
          message: "No password set for this account. Use OTP login.",
        },
      });
      return;
    }

    const bcrypt = await import("bcrypt");
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid identifier or password",
        },
      });
      return;
    }

    const tokens = authService.generateTokens(foundUser);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: foundUser._id,
          phone: foundUser.phone,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
          outlets: foundUser.outlets,
          currentOutlet: foundUser.currentOutlet,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error: any) {
    console.error("Error in login:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An error occurred during login",
      },
    });
  }
};

/**
 * Set password for a user after verifying ownership via Firebase ID token (OTP)
 * POST /api/auth/set-password
 */
export const setPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { idToken, password } = req.body;

    if (!idToken || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: "TOKEN_OR_PASSWORD_REQUIRED",
          message: "idToken and password are required",
        },
      });
      return;
    }

    if (typeof password !== "string" || password.length < 6) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PASSWORD",
          message: "Password must be at least 6 characters",
        },
      });
      return;
    }

    // Verify idToken using otpService (reuses existing OTP verification logic)
    const verificationResult = await otpService.verifyOTP(idToken);
    if (!verificationResult.success || !verificationResult.phone) {
      res.status(401).json({
        success: false,
        error: {
          code: "VERIFICATION_FAILED",
          message: verificationResult.error || "Invalid token",
        },
      });
      return;
    }

    const phone = verificationResult.phone;
    const user = await User.findOne({ phone, isActive: true });
    if (!user) {
      res
        .status(404)
        .json({
          success: false,
          error: { code: "USER_NOT_FOUND", message: "User not found" },
        });
      return;
    }

    const bcrypt = await import("bcrypt");
    const hashed = await bcrypt.hash(password, 10);

    user.password = hashed as any;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password set successfully" });
  } catch (error: any) {
    console.error("Error in setPassword:", error);
    res
      .status(500)
      .json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred while setting password",
        },
      });
  }
};
