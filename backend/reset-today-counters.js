/**
 * Script to reset today's counters and remove today's KOTs
 * This fixes duplicate key errors for KOT numbers
 *
 * Usage: node reset-today-counters.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant";

async function resetTodayCounters() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get today's date string
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    console.log(`\n📅 Today's date: ${dateStr}`);

    // Delete today's KOT counters using MongoDB native query
    const db = mongoose.connection.db;
    const counterResult = await db.collection("counters").deleteMany({
      _id: { $regex: `^kot_.*_${dateStr}$` },
    });
    console.log(
      `✅ Deleted ${counterResult.deletedCount} KOT counter(s) for today`
    );

    // Delete today's KOTs to allow fresh generation
    const KOT = mongoose.model(
      "KOT",
      new mongoose.Schema({}, { strict: false })
    );
    const todayStart = new Date(`${dateStr}T00:00:00.000Z`);
    const todayEnd = new Date(`${dateStr}T23:59:59.999Z`);

    const kotResult = await KOT.deleteMany({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });
    console.log(`✅ Deleted ${kotResult.deletedCount} KOT(s) created today`);

    console.log("\n✨ Today's counters reset! You can now create new orders.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error resetting counters:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

resetTodayCounters();
