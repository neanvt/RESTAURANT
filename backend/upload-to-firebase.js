/**
 * Script to upload existing local images to Firebase Storage
 * Run with: node upload-to-firebase.js
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin
const serviceAccount = require("./restopos-15a94-firebase-adminsdk-fbsvc-170f8160c3.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "restopos-15a94.firebasestorage.app",
});

const bucket = admin.storage().bucket();

async function uploadDirectory(dirPath, firebasePath) {
  console.log(`📁 Scanning directory: ${dirPath}`);

  if (!fs.existsSync(dirPath)) {
    console.log(`❌ Directory does not exist: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively upload subdirectories
      await uploadDirectory(filePath, `${firebasePath}/${file}`);
    } else {
      // Upload file
      const destination = `${firebasePath}/${file}`;
      console.log(`📤 Uploading: ${file} -> ${destination}`);

      try {
        await bucket.upload(filePath, {
          destination: destination,
          metadata: {
            contentType: getContentType(file),
            metadata: {
              firebaseStorageDownloadTokens: generateToken(),
            },
          },
        });

        // Make file publicly accessible
        await bucket.file(destination).makePublic();

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
        console.log(`✅ Uploaded: ${publicUrl}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${file}:`, error.message);
      }
    }
  }
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };
  return contentTypes[ext] || "application/octet-stream";
}

function generateToken() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Main execution
async function main() {
  console.log("🚀 Starting upload to Firebase Storage...\n");

  const uploadsDir = path.join(__dirname, "uploads");

  // Upload outlets folder
  await uploadDirectory(path.join(uploadsDir, "outlets"), "uploads/outlets");

  // Upload ai-images folder if exists
  const aiImagesDir = path.join(uploadsDir, "ai-images");
  if (fs.existsSync(aiImagesDir)) {
    await uploadDirectory(aiImagesDir, "uploads/ai-images");
  }

  console.log("\n✅ Upload complete!");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Upload failed:", error);
  process.exit(1);
});
