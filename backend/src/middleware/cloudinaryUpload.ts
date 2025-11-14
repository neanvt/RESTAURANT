import multer from "multer";
import { Request } from "express";
import cloudinary from "../config/cloudinary";
import { UploadApiResponse } from "cloudinary";
import path from "path";
import sharp from "sharp";

// Use memory storage for Cloudinary (works great with Vercel)
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
export const cloudinaryUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

/**
 * Upload buffer to Cloudinary
 * @param buffer - Image buffer
 * @param folder - Cloudinary folder (e.g., 'outlets', 'items')
 * @param options - Additional upload options
 * @returns Cloudinary secure URL
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = "restaurant",
  options: {
    transformation?: any;
    public_id?: string;
  } = {}
): Promise<string> {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `restaurant-pos/${folder}`,
          resource_type: "image",
          ...options,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error("❌ Cloudinary upload error:", error);
            reject(error);
          } else if (result) {
            console.log(`✅ Image uploaded to Cloudinary: ${result.secure_url}`);
            resolve(result.secure_url);
          } else {
            reject(new Error("Upload failed - no result"));
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("❌ Failed to upload to Cloudinary:", error);
    throw error;
  }
}

/**
 * Upload and optimize image to Cloudinary
 * Resizes outlet logos to 512x256 and items images to 800x800
 * @param buffer - Original image buffer
 * @param folder - Cloudinary folder
 * @param type - 'outlet' or 'item' for different optimizations
 * @returns Cloudinary secure URL
 */
export async function uploadAndOptimizeToCloudinary(
  buffer: Buffer,
  folder: string,
  type: "outlet" | "item" = "item"
): Promise<string> {
  try {
    // Optimize image with Sharp before uploading
    let optimizedBuffer: Buffer;

    if (type === "outlet") {
      // Outlet logos: 512x256
      optimizedBuffer = await sharp(buffer)
        .resize(512, 256, {
          fit: "cover",
          position: "center",
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    } else {
      // Item images: 800x800
      optimizedBuffer = await sharp(buffer)
        .resize(800, 800, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // Upload optimized buffer to Cloudinary
    return await uploadToCloudinary(optimizedBuffer, folder);
  } catch (error) {
    console.error("❌ Failed to optimize and upload:", error);
    throw error;
  }
}

/**
 * Delete image from Cloudinary
 * @param imageUrl - Full Cloudinary URL
 */
export async function deleteFromCloudinary(imageUrl: string): Promise<void> {
  try {
    // Extract public_id from URL
    // Example: https://res.cloudinary.com/neelesh/image/upload/v1234567890/restaurant-pos/outlets/image.jpg
    const urlParts = imageUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
      console.warn("⚠️  Invalid Cloudinary URL:", imageUrl);
      return;
    }

    // Get public_id (everything after /upload/vXXXXXXXXXX/)
    const publicIdParts = urlParts.slice(uploadIndex + 2);
    const publicIdWithExt = publicIdParts.join("/");

    // Remove file extension
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

    console.log(`🗑️  Deleting from Cloudinary: ${publicId}`);

    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Image deleted from Cloudinary`);
  } catch (error) {
    console.error("❌ Failed to delete from Cloudinary:", error);
    // Don't throw error - deletion failures shouldn't break the app
  }
}
