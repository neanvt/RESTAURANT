/**
 * Script to delete ALL KOTs and reset ALL KOT counters
 * This completely clears the KOT history for a fresh start
 *
 * WARNING: This will delete all KOT records!
 *
 * Usage: node clear-all-kots.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant";

async function clearAllKOTs() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Delete ALL KOTs
    const db = mongoose.connection.db;
    const kotResult = await db.collection("kots").deleteMany({});
    console.log(`✅ Deleted ${kotResult.deletedCount} KOT(s) from database`);

    // Delete ALL KOT counters
    const counterResult = await db.collection("counters").deleteMany({
      _id: { $regex: "^kot_" },
    });
    console.log(`✅ Deleted ${counterResult.deletedCount} KOT counter(s)`);

    console.log("\n✨ All KOTs cleared! Fresh start available.");
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error clearing KOTs:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

clearAllKOTs();
