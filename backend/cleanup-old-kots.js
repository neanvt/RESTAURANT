/**
 * Cleanup script for old KOT records
 * Marks KOTs older than 30 days as inactive to keep database clean
 * Run this script periodically via cron job or manually
 */

require("dotenv").config();
const mongoose = require("mongoose");

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// KOT Schema
const kotSchema = new mongoose.Schema(
  {
    outletId: { type: mongoose.Schema.Types.ObjectId, ref: "Outlet" },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    kotNumber: String,
    items: [Object],
    status: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const KOT = mongoose.model("KOT", kotSchema);

const cleanupOldKOTs = async () => {
  try {
    await connectDB();

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log(`\n🔍 Looking for KOTs older than ${thirtyDaysAgo.toLocaleDateString()}...`);

    // Find old completed KOTs
    const oldKOTs = await KOT.find({
      createdAt: { $lt: thirtyDaysAgo },
      status: "completed",
      isActive: true,
    });

    console.log(`📊 Found ${oldKOTs.length} old completed KOTs to mark as inactive`);

    if (oldKOTs.length === 0) {
      console.log("✅ No old KOTs to cleanup");
      process.exit(0);
    }

    // Mark them as inactive
    const result = await KOT.updateMany(
      {
        createdAt: { $lt: thirtyDaysAgo },
        status: "completed",
        isActive: true,
      },
      {
        $set: { isActive: false },
      }
    );

    console.log(`\n✅ Cleanup completed successfully!`);
    console.log(`📝 Updated ${result.modifiedCount} KOT records`);
    console.log(`\nDetails:`);
    console.log(`- KOTs marked as inactive: ${result.modifiedCount}`);
    console.log(`- Date cutoff: ${thirtyDaysAgo.toLocaleDateString()}`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error during cleanup:`, error);
    process.exit(1);
  }
};

// Run the cleanup
cleanupOldKOTs();
