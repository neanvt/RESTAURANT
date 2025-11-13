import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Determine if we're running in a serverless environment (like Vercel)
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTIONS_WORKER);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    // Console transport - always available
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
});

// Only add file transports in non-serverless environments
if (!isServerless && process.env.NODE_ENV !== "test") {
  try {
    // File transport for errors
    logger.add(new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }));
    
    // File transport for all logs
    logger.add(new winston.transports.File({
      filename: "logs/combined.log",
    }));
  } catch (error) {
    // If file logging fails, just continue with console logging
    console.warn("File logging not available, using console only");
  }
}

export default logger;
