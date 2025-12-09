import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";
import { connectDatabase } from "./config/database";
import authRoutes from "./routes/authRoutes";
import outletRoutes from "./routes/outletRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import itemRoutes from "./routes/itemRoutes";
import orderRoutes from "./routes/orderRoutes";
import kotRoutes from "./routes/kotRoutes";
import invoiceRoutes from "./routes/invoiceRoutes";
import customerRoutes from "./routes/customerRoutes";
import reportRoutes from "./routes/reportRoutes";
import staffRoutes from "./routes/staffRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import printerRoutes from "./routes/printerRoutes";
import menuScanRoutes from "./routes/menuScanRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";

const app: Application = express();

// Security middleware with relaxed policies for images
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// Handle preflight requests first
app.options("*", (_req, res) => {
  res.header("Access-Control-Allow-Origin", _req.headers.origin || "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", "86400");
  res.sendStatus(204);
});

// CORS configuration
// Direct CORS configuration to fix immediate issues
const allowedOrigins = [
  "https://restaurant-frontend-yvss.vercel.app",
  "https://restaurant-frontend-bice.vercel.app",
  "https://swadika.foodstall.in",
  "https://api.swadika.foodstall.in",
  "http://localhost:3000",
  "http://localhost:4200",
];

// Add environment variable support as fallback
const envOrigins = process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN;
if (envOrigins) {
  const additionalOrigins = envOrigins
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  allowedOrigins.push(...additionalOrigins);
}

console.log("🔍 CORS Configuration:");
console.log("- Allowed origins:", allowedOrigins);
console.log("- Environment ALLOWED_ORIGINS:", process.env.ALLOWED_ORIGINS);

app.use(
  cors({
    origin: (origin, callback) => {
      console.log(`🌐 CORS request from origin: ${origin}`);

      // Allow requests with no origin (mobile apps, curl, postman, etc.)
      if (!origin) {
        console.log("✅ Allowing request with no origin");
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        console.log("✅ Origin allowed");
        return callback(null, true);
      }

      // Log and reject
      console.warn(
        `❌ CORS blocked: ${origin}. Allowed: ${allowedOrigins.join(", ")}`
      );
      return callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Serve static files for uploads with CORS headers
app.use(
  "/uploads",
  (_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(process.cwd(), "uploads"))
);

// Database connection middleware for serverless
app.use(async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    res.status(503).json({
      success: false,
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "Database connection failed. Please try again later.",
      },
    });
  }
});

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/outlets", outletRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/kots", kotRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/printers", printerRoutes);
app.use("/api/menu-scan", menuScanRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
// AI feature removed per request: ai routes are no longer registered
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

// Global error handler
app.use(errorHandler);

export default app;
