const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Item schema (simplified)
const itemSchema = new mongoose.Schema({}, { strict: false });
const Item = mongoose.model("Item", itemSchema);

async function fixImagePaths() {
  try {
    console.log("🔧 Fixing item image paths...\n");

    // Find all items with images
    const items = await Item.find({
      "image.url": { $exists: true, $ne: null },
    });

    console.log(`Found ${items.length} items with images\n`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      const oldUrl = item.image.url;

      // Skip if already correct or external URL
      if (
        oldUrl.startsWith("http://") ||
        oldUrl.startsWith("https://") ||
        oldUrl.includes("/uploads/outlets/") ||
        oldUrl.includes("/uploads/items/")
      ) {
        console.log(`✓ Skipped: ${item.name} (already correct)`);
        skippedCount++;
        continue;
      }

      // Fix outlet logo paths
      if (oldUrl.includes("outlet-logo-")) {
        const newUrl = oldUrl.replace(
          "/uploads/outlet-logo-",
          "/uploads/outlets/outlet-logo-"
        );
        item.image.url = newUrl;
        await item.save();
        console.log(`✅ Fixed: ${item.name}`);
        console.log(`   Old: ${oldUrl}`);
        console.log(`   New: ${newUrl}\n`);
        fixedCount++;
      }
      // Fix item image paths (if any)
      else if (oldUrl.includes("item-image-")) {
        const newUrl = oldUrl.replace(
          "/uploads/item-image-",
          "/uploads/items/item-image-"
        );
        item.image.url = newUrl;
        await item.save();
        console.log(`✅ Fixed: ${item.name}`);
        console.log(`   Old: ${oldUrl}`);
        console.log(`   New: ${newUrl}\n`);
        fixedCount++;
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   Fixed: ${fixedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Total: ${items.length}`);
    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

fixImagePaths();
