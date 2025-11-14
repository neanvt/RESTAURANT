import dotenv from "dotenv";

// Load environment variables FIRST, before any other imports
dotenv.config();

import app from "./app";
import { connectDatabase } from "./config/database";
import logger from "./utils/logger";

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDatabase();

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
    });

    return server;
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server (but don't wait for it in serverless environments)
let serverInstance: any = null;
startServer().then((server) => {
  serverInstance = server;
});

// For Vercel serverless, export the app directly
export default app;

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Rejection:", err);
  if (serverInstance) {
    serverInstance.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  if (serverInstance) {
    serverInstance.close(() => {
      logger.info("HTTP server closed");
    });
  }
});
