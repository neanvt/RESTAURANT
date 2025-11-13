/**
 * Migration script to fix outlet logo paths
 *
 * This script updates existing outlet logo paths in the database
 * from /uploads/filename.jpg to /uploads/outlets/filename.jpg
 *
 * Run with: node fix-outlet-logo-paths.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

// Outlet Schema (simplified)
const outletSchema = new mongoose.Schema(
  {
    logo: String,
  },
  { strict: false }
);

const Outlet = mongoose.model("Outlet", outletSchema);

async function fixLogoPath() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant-pos";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully");

    // Find all outlets with logos that don't include '/outlets/'
    const outlets = await Outlet.find({
      logo: { $regex: "^/uploads/(?!outlets)", $ne: null },
    });

    console.log(`Found ${outlets.length} outlets with incorrect logo paths`);

    // Update each outlet
    for (const outlet of outlets) {
      const oldPath = outlet.logo;
      // Extract just the filename
      const filename = oldPath.replace("/uploads/", "");
      // Create new path with outlets subdirectory
      const newPath = `/uploads/outlets/${filename}`;

      console.log(`Updating outlet ${outlet._id}:`);
      console.log(`  Old: ${oldPath}`);
      console.log(`  New: ${newPath}`);

      await Outlet.updateOne({ _id: outlet._id }, { $set: { logo: newPath } });
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("All outlet logo paths have been updated.");
  } catch (error) {
    console.error("❌ Error during migration:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the migration
fixLogoPath();
