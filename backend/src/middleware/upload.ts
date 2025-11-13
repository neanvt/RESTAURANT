import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { Request, Response, NextFunction } from "express";

// Configure storage
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "outlets");

    // Create directory if it doesn't exist
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error("Error creating upload directory:", error);
    }

    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `outlet-logo-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow images
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
      )
    );
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware to process and optimize images with Sharp
export const processImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      next();
      return;
    }

    const inputPath = req.file.path;
    const outputFilename = `optimized-${req.file.filename}`;
    const outputPath = path.join(path.dirname(inputPath), outputFilename);

    // Process image with Sharp - resize to 512x256 for outlet logos
    await sharp(inputPath)
      .resize(512, 256, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    // Delete original file
    await fs.unlink(inputPath);

    // Update req.file with new file info
    req.file.filename = outputFilename;
    req.file.path = outputPath;

    next();
  } catch (error) {
    console.error("Error processing image:", error);

    // Clean up files if error occurs
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error("Error cleaning up file:", unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      error: {
        code: "IMAGE_PROCESSING_ERROR",
        message: "Failed to process image",
      },
    });
  }
};

// Middleware to handle multer errors
export const handleMulterError = (
  error: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        error: {
          code: "FILE_TOO_LARGE",
          message: "File size exceeds 5MB limit",
        },
      });
      return;
    }

    res.status(400).json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message: error.message,
      },
    });
    return;
  }

  if (error) {
    res.status(400).json({
      success: false,
      error: {
        code: "UPLOAD_ERROR",
        message: error.message,
      },
    });
    return;
  }

  next();
};
