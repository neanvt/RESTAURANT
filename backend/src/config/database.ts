import mongoose from "mongoose";
import logger from "../utils/logger";

// Cache the connection promise for serverless reuse
let cachedConnection: typeof mongoose | null = null;

export const connectDatabase = async (): Promise<typeof mongoose> => {
  // If already connected, return the cached connection
  if (cachedConnection && mongoose.connection.readyState === 1) {
    logger.info("✅ Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant_pos";

    logger.info("🔌 Connecting to MongoDB...");
    logger.info(`📍 MongoDB URI: ${mongoUri.replace(/\/\/.*:.*@/, '//*****:*****@')}`);

    // Set mongoose options for better serverless performance
    mongoose.set('strictQuery', false);
    
    const connection = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });

    cachedConnection = connection;
    logger.info("✅ MongoDB connected successfully");

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
      cachedConnection = null; // Clear cache on error
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
      cachedConnection = null; // Clear cache on disconnect
    });

    return connection;
  } catch (error) {
    logger.error("❌ Failed to connect to MongoDB:", error);
    cachedConnection = null;
    
    // In serverless, don't exit - just throw the error
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      throw error;
    } else {
      process.exit(1);
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected");
  } catch (error) {
    logger.error("Error disconnecting from MongoDB:", error);
  }
};
