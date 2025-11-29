const mongoose = require("mongoose");
require("dotenv").config();

async function fixCounter() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const ordersCollection = db.collection("orders");
    const countersCollection = db.collection("counters");

    const outletId = "6911dfeda7eaf9ad178c1a03";
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12

    // Calculate financial year
    const financialYearStart = currentMonth < 4 ? currentYear - 1 : currentYear;
    const financialYearEnd = financialYearStart + 1;
    const fy = `FY${financialYearStart}-${financialYearEnd}`;
    const counterId = `order_${outletId}_${fy}`;

    console.log(`📊 Financial Year: ${fy}`);
    console.log(`🆔 Counter ID: ${counterId}\n`);

    // Get all orders for this FY and outlet
    const fyStartDate = new Date(financialYearStart, 3, 1); // April 1
    const fyEndDate = new Date(financialYearEnd, 2, 31, 23, 59, 59); // March 31

    const orders = await ordersCollection
      .find({
        outletId: new mongoose.Types.ObjectId(outletId),
        createdAt: { $gte: fyStartDate, $lte: fyEndDate },
      })
      .sort({ createdAt: 1 })
      .toArray();

    console.log(`📋 Found ${orders.length} orders in current FY:`);
    orders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderNumber} - ${order.createdAt}`);
    });

    // Check current counter
    const currentCounter = await countersCollection.findOne({ _id: counterId });
    console.log(`\n🔢 Current counter:`, currentCounter);

    // Fix counter to match the actual order count
    const correctCount = orders.length;
    console.log(`\n✅ Setting counter to ${correctCount}`);

    await countersCollection.updateOne(
      { _id: counterId },
      {
        $set: {
          sequence: correctCount,
          date: new Date(),
        },
      },
      { upsert: true }
    );

    console.log("✅ Counter fixed!");

    // Verify
    const updatedCounter = await countersCollection.findOne({ _id: counterId });
    console.log("\n🔍 Updated counter:", updatedCounter);

    await mongoose.disconnect();
    console.log("\n✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixCounter();
