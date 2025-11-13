import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/User";

interface TokenPayload {
  userId: string;
  phone: string;
  role: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  private readonly REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET || "your-refresh-secret";
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "60d";
  private readonly REFRESH_TOKEN_EXPIRES_IN =
    process.env.REFRESH_TOKEN_EXPIRES_IN || "180d";

  /**
   * Generate access and refresh tokens for a user
   */
  generateTokens(user: IUser): TokenResponse {
    const payload: TokenPayload = {
      userId: String(user._id),
      phone: user.phone,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN as string,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN as string,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  /**
   * Verify and decode access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired access token");
    }
  }

  /**
   * Verify and decode refresh token
   */
  verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(
        token,
        this.REFRESH_TOKEN_SECRET
      ) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  /**
   * Find or create user by phone number
   */
  async findOrCreateUser(phone: string, name?: string): Promise<IUser> {
    let user = await User.findOne({ phone, isActive: true });

    if (!user) {
      user = await User.create({
        phone,
        name,
        role: "primary_admin", // First user with a phone becomes primary admin
        permissions: [
          "manage_items",
          "manage_orders",
          "manage_customers",
          "view_reports",
          "manage_staff",
          "manage_outlets",
          "manage_expenses",
          "manage_inventory",
        ],
        isActive: true,
      });
    }

    return user;
  }

  /**
   * Create a new user (used for signup)
   */
  async createUser(
    phone: string,
    name?: string,
    email?: string,
    password?: string
  ): Promise<IUser> {
    const existing = await User.findOne({
      $or: [{ phone }, { email }],
      isActive: true,
    });
    if (existing) {
      throw new Error("User with given phone or email already exists");
    }

    const createData: any = {
      phone,
      name,
      email,
      role: "staff",
      permissions: [],
      isActive: true,
    };

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      createData.password = hashed;
    }

    const user = await User.create(createData);

    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId)
      .populate("outlets")
      .populate("currentOutlet");
  }

  /**
   * Get user by phone
   */
  async getUserByPhone(phone: string): Promise<IUser | null> {
    return await User.findOne({ phone, isActive: true })
      .populate("outlets")
      .populate("currentOutlet");
  }

  /**
   * Update user details
   */
  async updateUser(
    userId: string,
    updates: Partial<IUser>
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("outlets")
      .populate("currentOutlet");
  }

  /**
   * Refresh tokens using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    const decoded = this.verifyRefreshToken(refreshToken);
    const user = await this.getUserById(decoded.userId);

    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    return this.generateTokens(user);
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    // Indian phone number validation (10 digits starting with 6-9)
    return /^[6-9]\d{9}$/.test(phone);
  }
}

export default new AuthService();
