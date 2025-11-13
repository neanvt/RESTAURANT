const mongoose = require("mongoose");
require("dotenv").config();

const itemSchema = new mongoose.Schema(
  {
    name: String,
    image: {
      url: String,
      isAiGenerated: Boolean,
    },
  },
  { collection: "items" }
);

const Item = mongoose.model("Item", itemSchema);

async function verifyAndFixItems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all items
    const items = await Item.find({});
    console.log(`\nFound ${items.length} items\n`);

    for (const item of items) {
      console.log(`\n--- Item: ${item.name} ---`);
      console.log(`ID: ${item._id}`);
      console.log(`Current image.url: "${item.image?.url || "NO IMAGE"}"`);

      // Check if image URL is incomplete
      if (item.image?.url && item.image.url.endsWith("/outlets/")) {
        console.log("❌ INCOMPLETE PATH DETECTED!");

        // Try to find the correct file in uploads/outlets
        const fs = require("fs");
        const path = require("path");
        const uploadsDir = path.join(__dirname, "uploads", "outlets");

        if (fs.existsSync(uploadsDir)) {
          const files = fs.readdirSync(uploadsDir);
          console.log(
            `Available files in uploads/outlets: ${files.join(", ")}`
          );

          if (files.length > 0) {
            // Use the most recent file (highest timestamp)
            const sortedFiles = files.sort().reverse();
            const selectedFile = sortedFiles[0];
            const newPath = `/uploads/outlets/${selectedFile}`;

            console.log(`Updating to: ${newPath}`);
            item.image.url = newPath;
            await item.save();
            console.log("✅ Updated successfully!");
          } else {
            console.log("No files found in uploads/outlets");
          }
        }
      } else if (item.image?.url) {
        console.log("✅ Path looks complete");
      } else {
        console.log("⚠️  No image set for this item");
      }
    }

    console.log("\n\n=== VERIFICATION COMPLETE ===\n");

    // Show final state
    const updatedItems = await Item.find({});
    for (const item of updatedItems) {
      if (item.image?.url) {
        console.log(`${item.name}: ${item.image.url}`);
      }
    }

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

verifyAndFixItems();
