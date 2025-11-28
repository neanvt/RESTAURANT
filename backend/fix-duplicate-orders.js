/**
 * Script to fix duplicate order and KOT numbers in the database
 * Run this if you're experiencing E11000 duplicate key errors
 *
 * Usage: node fix-duplicate-orders.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant";

async function fixDuplicateOrders() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const Order = mongoose.model(
      "Order",
      new mongoose.Schema({}, { strict: false })
    );
    const KOT = mongoose.model(
      "KOT",
      new mongoose.Schema({}, { strict: false })
    );
    const Invoice = mongoose.model(
      "Invoice",
      new mongoose.Schema({}, { strict: false })
    );

    // Fix duplicate orders
    console.log("\n🔍 Searching for duplicate orders...");
    const duplicates = await Order.aggregate([
      {
        $group: {
          _id: { outletId: "$outletId", orderNumber: "$orderNumber" },
          count: { $sum: 1 },
          ids: { $push: "$_id" },
          createdAts: { $push: "$createdAt" },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ]);

    if (duplicates.length === 0) {
      console.log("✅ No duplicate orders found!");
      await mongoose.disconnect();
      return;
    }

    console.log(`⚠️  Found ${duplicates.length} duplicate order number(s)`);

    for (const dup of duplicates) {
      console.log(
        `\n📋 Duplicate: ${dup._id.orderNumber} (${dup.count} instances)`
      );

      // Keep the oldest order (first created), delete the rest
      const sortedByDate = dup.ids
        .map((id, idx) => ({ id, createdAt: dup.createdAts[idx] }))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      const keepId = sortedByDate[0].id;
      const deleteIds = sortedByDate.slice(1).map((item) => item.id);

      console.log(
        `   Keeping: ${keepId} (created: ${sortedByDate[0].createdAt})`
      );
      console.log(`   Deleting: ${deleteIds.length} duplicate(s)`);

      // Delete duplicates
      const result = await Order.deleteMany({ _id: { $in: deleteIds } });
      console.log(`   ✅ Deleted ${result.deletedCount} duplicate order(s)`);
    }

    // Fix duplicate KOTs
    console.log("\n🔍 Searching for duplicate KOTs...");
    const kotDuplicates = await KOT.aggregate([
      {
        $group: {
          _id: { outletId: "$outletId", kotNumber: "$kotNumber" },
          count: { $sum: 1 },
          ids: { $push: "$_id" },
          createdAts: { $push: "$createdAt" },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ]);

    if (kotDuplicates.length === 0) {
      console.log("✅ No duplicate KOTs found!");
    } else {
      console.log(`⚠️  Found ${kotDuplicates.length} duplicate KOT number(s)`);

      for (const dup of kotDuplicates) {
        console.log(
          `\n📋 Duplicate KOT: ${dup._id.kotNumber} (${dup.count} instances)`
        );

        // Keep the oldest KOT (first created), delete the rest
        const sortedByDate = dup.ids
          .map((id, idx) => ({ id, createdAt: dup.createdAts[idx] }))
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        const keepId = sortedByDate[0].id;
        const deleteIds = sortedByDate.slice(1).map((item) => item.id);

        console.log(
          `   Keeping: ${keepId} (created: ${sortedByDate[0].createdAt})`
        );
        console.log(`   Deleting: ${deleteIds.length} duplicate(s)`);

        // Delete duplicates
        const result = await KOT.deleteMany({ _id: { $in: deleteIds } });
        console.log(`   ✅ Deleted ${result.deletedCount} duplicate KOT(s)`);
      }
    }

    // Fix duplicate invoices
    console.log("\n🔍 Searching for duplicate invoices...");
    const invoiceDuplicates = await Invoice.aggregate([
      {
        $group: {
          _id: { outletId: "$outletId", invoiceNumber: "$invoiceNumber" },
          count: { $sum: 1 },
          ids: { $push: "$_id" },
          createdAts: { $push: "$createdAt" },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ]);

    if (invoiceDuplicates.length === 0) {
      console.log("✅ No duplicate invoices found!");
    } else {
      console.log(
        `⚠️  Found ${invoiceDuplicates.length} duplicate invoice number(s)`
      );

      for (const dup of invoiceDuplicates) {
        console.log(
          `\n📋 Duplicate invoice: ${dup._id.invoiceNumber} (${dup.count} instances)`
        );

        // Keep the oldest invoice (first created), delete the rest
        const sortedByDate = dup.ids
          .map((id, idx) => ({ id, createdAt: dup.createdAts[idx] }))
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        const keepId = sortedByDate[0].id;
        const deleteIds = sortedByDate.slice(1).map((item) => item.id);

        console.log(
          `   Keeping: ${keepId} (created: ${sortedByDate[0].createdAt})`
        );
        console.log(`   Deleting: ${deleteIds.length} duplicate(s)`);

        // Delete duplicates
        const result = await Invoice.deleteMany({ _id: { $in: deleteIds } });
        console.log(
          `   ✅ Deleted ${result.deletedCount} duplicate invoice(s)`
        );
      }
    }

    console.log("\n✨ Database cleanup complete!");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error fixing duplicates:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixDuplicateOrders();
