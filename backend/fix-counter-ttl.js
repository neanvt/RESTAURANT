/**
 * Script to fix the Counter TTL index and recreate order counters
 * The old TTL index was deleting order/invoice counters prematurely
 *
 * Usage: node fix-counter-ttl.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant";

async function fixCounterTTL() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const countersCollection = db.collection("counters");

    // Get current indexes
    console.log("\n📋 Current indexes:");
    const indexes = await countersCollection.indexes();
    indexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
      if (index.expireAfterSeconds) {
        console.log(`    TTL: ${index.expireAfterSeconds} seconds`);
      }
    });

    // Drop the old TTL index
    try {
      console.log("\n🗑️  Dropping old TTL index on 'date' field...");
      await countersCollection.dropIndex("date_1");
      console.log("✅ Old TTL index dropped");
    } catch (error) {
      if (error.code === 27) {
        console.log("ℹ️  Index 'date_1' not found, skipping drop");
      } else {
        throw error;
      }
    }

    // Create new partial TTL index for KOT counters only
    console.log("\n🔧 Creating new partial TTL index for KOT counters...");
    await countersCollection.createIndex(
      { date: 1 },
      {
        expireAfterSeconds: 86400 * 7,
        partialFilterExpression: { type: "kot" },
        name: "kot_counter_ttl",
      }
    );
    console.log("✅ New partial TTL index created");

    // Update existing counters with type field
    console.log("\n🔄 Adding type field to existing counters...");
    const kotUpdate = await countersCollection.updateMany(
      { _id: /^kot_/ },
      { $set: { type: "kot" } }
    );
    console.log(`   ✅ Updated ${kotUpdate.modifiedCount} KOT counter(s)`);

    const orderUpdate = await countersCollection.updateMany(
      { _id: /^order_/ },
      { $set: { type: "order" } }
    );
    console.log(`   ✅ Updated ${orderUpdate.modifiedCount} order counter(s)`);

    const invoiceUpdate = await countersCollection.updateMany(
      { _id: /^invoice_/ },
      { $set: { type: "invoice" } }
    );
    console.log(
      `   ✅ Updated ${invoiceUpdate.modifiedCount} invoice counter(s)`
    );

    // Find the outlet and recreate the order counter
    console.log("\n🔍 Finding outlet and order information...");
    const Order = mongoose.model(
      "Order",
      new mongoose.Schema({}, { strict: false })
    );

    // Get all outlets with orders
    const ordersWithOutlets = await Order.aggregate([
      {
        $group: { _id: "$outletId", maxOrderNumber: { $max: "$orderNumber" } },
      },
    ]);

    console.log(`\n📊 Found ${ordersWithOutlets.length} outlet(s) with orders`);

    for (const outlet of ordersWithOutlets) {
      const outletId = outlet._id.toString();
      const maxOrderNumber = outlet.maxOrderNumber;

      console.log(`\n🏪 Processing outlet: ${outletId}`);
      console.log(`   Last order number: ${maxOrderNumber}`);

      // Extract sequence from order number (e.g., "007/25-26" -> 7)
      const match = maxOrderNumber.match(/^(\d+)\//);
      if (!match) {
        console.log(
          `   ⚠️  Could not parse order number format: ${maxOrderNumber}`
        );
        continue;
      }

      const currentSequence = parseInt(match[1], 10);

      // Extract financial year from order number (e.g., "007/25-26" -> "2025-2026")
      const fyMatch = maxOrderNumber.match(/\/(\d{2})-(\d{2})$/);
      if (!fyMatch) {
        console.log(
          `   ⚠️  Could not parse financial year from: ${maxOrderNumber}`
        );
        continue;
      }

      const fyStart = 2000 + parseInt(fyMatch[1], 10);
      const fyEnd = 2000 + parseInt(fyMatch[2], 10);

      // Create or update counter
      const counterId = `order_${outletId}_FY${fyStart}-${fyEnd}`;
      const fyDate = new Date(`${fyStart}-04-01T00:00:00.000Z`);

      console.log(`   📝 Counter ID: ${counterId}`);
      console.log(`   📅 FY Date: ${fyDate.toISOString()}`);
      console.log(`   🔢 Setting sequence to: ${currentSequence}`);

      const result = await countersCollection.updateOne(
        { _id: counterId },
        {
          $set: {
            sequence: currentSequence,
            date: fyDate,
            type: "order",
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        console.log(`   ✅ Counter created with sequence ${currentSequence}`);
      } else {
        console.log(`   ✅ Counter updated to sequence ${currentSequence}`);
      }
    }

    // Show final indexes
    console.log("\n📋 Final indexes:");
    const finalIndexes = await countersCollection.indexes();
    finalIndexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
      if (index.expireAfterSeconds) {
        console.log(`    TTL: ${index.expireAfterSeconds} seconds`);
      }
      if (index.partialFilterExpression) {
        console.log(
          `    Partial filter:`,
          JSON.stringify(index.partialFilterExpression)
        );
      }
    });

    console.log("\n✨ Counter TTL fix completed successfully!");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error fixing counter TTL:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixCounterTTL();
