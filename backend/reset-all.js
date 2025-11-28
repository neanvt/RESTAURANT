/**
 * Script to completely reset all orders, invoices, KOTs and their counters
 * This gives you a completely fresh start
 *
 * WARNING: This will delete ALL orders, invoices, and KOTs!
 *
 * Usage: node reset-all.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant";

async function resetAll() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    // Delete ALL orders
    const orderResult = await db.collection("orders").deleteMany({});
    console.log(`✅ Deleted ${orderResult.deletedCount} order(s)`);

    // Delete ALL invoices
    const invoiceResult = await db.collection("invoices").deleteMany({});
    console.log(`✅ Deleted ${invoiceResult.deletedCount} invoice(s)`);

    // Delete ALL KOTs
    const kotResult = await db.collection("kots").deleteMany({});
    console.log(`✅ Deleted ${kotResult.deletedCount} KOT(s)`);

    // Delete ALL counters (order, invoice, KOT)
    const counterResult = await db.collection("counters").deleteMany({});
    console.log(`✅ Deleted ${counterResult.deletedCount} counter(s)`);

    console.log("\n✨ Complete reset done! Fresh start available.");
    console.log("📝 Next numbers will be:");
    console.log("   Orders: 001/25-26");
    console.log("   Invoices: 001");
    console.log("   KOTs: 001");

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error resetting:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

resetAll();
