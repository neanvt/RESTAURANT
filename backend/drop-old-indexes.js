const mongoose = require("mongoose");
require("dotenv").config();

async function dropOldIndexes() {
  try {
    // Connect to MongoDB
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/test";
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    // Drop old unique indexes
    try {
      await db.collection("orders").dropIndex("orderNumber_1");
      console.log("✅ Dropped orders.orderNumber_1 index");
    } catch (e) {
      console.log(
        "⚠️  orders.orderNumber_1 index does not exist or already dropped"
      );
    }

    try {
      await db.collection("kots").dropIndex("kotNumber_1");
      console.log("✅ Dropped kots.kotNumber_1 index");
    } catch (e) {
      console.log(
        "⚠️  kots.kotNumber_1 index does not exist or already dropped"
      );
    }

    try {
      await db.collection("invoices").dropIndex("invoiceNumber_1");
      console.log("✅ Dropped invoices.invoiceNumber_1 index");
    } catch (e) {
      console.log(
        "⚠️  invoices.invoiceNumber_1 index does not exist or already dropped"
      );
    }

    console.log("\n✅ All old indexes have been dropped successfully!");
    console.log("👉 Now restart your backend server with: npm run dev");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

dropOldIndexes();
