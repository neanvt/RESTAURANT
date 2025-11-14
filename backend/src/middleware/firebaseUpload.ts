import multer from "multer";
import { Request } from "express";
import admin from "../config/firebaseAdmin";
import path from "path";

// Use memory storage instead of disk storage for Vercel
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

// Configure multer
export const firebaseUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Helper function to upload buffer to Firebase Storage
export async function uploadToFirebase(
  buffer: Buffer,
  originalname: string,
  folder: string = "uploads"
): Promise<string> {
  try {
    // Check if Firebase Admin is initialized
    if (!admin.apps.length) {
      throw new Error("Firebase Admin is not initialized");
    }

    const bucket = admin.storage().bucket();
    
    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000000);
    const ext = path.extname(originalname);
    const filename = `${folder}/${timestamp}-${random}${ext}`;

    // Create file reference
    const file = bucket.file(filename);

    // Upload the buffer
    await file.save(buffer, {
      metadata: {
        contentType: getContentType(ext),
        metadata: {
          firebaseStorageDownloadTokens: generateToken(),
        },
      },
    });

    // Make file publicly accessible
    await file.makePublic();

    // Return public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    console.log(`✅ File uploaded to Firebase Storage: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error("❌ Failed to upload to Firebase Storage:", error);
    throw error;
  }
}

// Helper function to delete file from Firebase Storage
export async function deleteFromFirebase(fileUrl: string): Promise<void> {
  try {
    if (!admin.apps.length) {
      throw new Error("Firebase Admin is not initialized");
    }

    const bucket = admin.storage().bucket();
    
    // Extract filename from URL
    const urlParts = fileUrl.split(`${bucket.name}/`);
    if (urlParts.length < 2) {
      console.warn("⚠️  Invalid Firebase Storage URL:", fileUrl);
      return;
    }
    
    const filename = urlParts[1];
    
    // Delete the file
    await bucket.file(filename).delete();
    console.log(`✅ File deleted from Firebase Storage: ${filename}`);
  } catch (error) {
    console.error("❌ Failed to delete from Firebase Storage:", error);
    // Don't throw error - deletion failures shouldn't break the app
  }
}

function getContentType(ext: string): string {
  const contentTypes: { [key: string]: string } = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };
  return contentTypes[ext.toLowerCase()] || "application/octet-stream";
}

function generateToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
