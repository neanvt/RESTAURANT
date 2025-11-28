/**
 * Script to reset the current financial year counters
 * This clears orders and invoices for fresh numbering
 *
 * WARNING: This will delete orders and invoices for the current FY!
 *
 * Usage: node reset-fy-counters.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant";

async function resetFYCounters() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Calculate current financial year
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const financialYearStart = month < 4 ? year - 1 : year;
    const financialYearEnd = financialYearStart + 1;

    console.log(
      `\n📅 Current Financial Year: ${financialYearStart}-${financialYearEnd}`
    );

    const db = mongoose.connection.db;

    // Delete order counters for current FY
    const orderCounterResult = await db.collection("counters").deleteMany({
      _id: { $regex: `^order_.*_FY${financialYearStart}-${financialYearEnd}$` },
    });
    console.log(
      `✅ Deleted ${orderCounterResult.deletedCount} order counter(s) for FY ${financialYearStart}-${financialYearEnd}`
    );

    // Delete invoice counters for current FY
    const invoiceCounterResult = await db.collection("counters").deleteMany({
      _id: {
        $regex: `^invoice_.*_FY${financialYearStart}-${financialYearEnd}$`,
      },
    });
    console.log(
      `✅ Deleted ${invoiceCounterResult.deletedCount} invoice counter(s) for FY ${financialYearStart}-${financialYearEnd}`
    );

    // Optional: Delete orders from current FY (comment out if you want to keep them)
    const fyStart = new Date(`${financialYearStart}-04-01T00:00:00.000Z`);
    const fyEnd = new Date(`${financialYearEnd}-03-31T23:59:59.999Z`);

    const orderResult = await db.collection("orders").deleteMany({
      createdAt: { $gte: fyStart, $lte: fyEnd },
    });
    console.log(
      `✅ Deleted ${orderResult.deletedCount} order(s) from FY ${financialYearStart}-${financialYearEnd}`
    );

    // Optional: Delete invoices from current FY
    const invoiceResult = await db.collection("invoices").deleteMany({
      createdAt: { $gte: fyStart, $lte: fyEnd },
    });
    console.log(
      `✅ Deleted ${invoiceResult.deletedCount} invoice(s) from FY ${financialYearStart}-${financialYearEnd}`
    );

    console.log("\n✨ Financial year counters reset! Fresh start available.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error resetting FY counters:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

resetFYCounters();
