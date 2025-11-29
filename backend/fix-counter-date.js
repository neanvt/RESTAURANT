const mongoose = require("mongoose");
require("dotenv").config();

async function fixCounterDate() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const countersCollection = db.collection("counters");

    const outletId = "6911dfeda7eaf9ad178c1a03";
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12

    // Calculate financial year
    const financialYearStart = currentMonth < 4 ? currentYear - 1 : currentYear;
    const financialYearEnd = financialYearStart + 1;
    const fy = `FY${financialYearStart}-${financialYearEnd}`;
    const counterId = `order_${outletId}_${fy}`;

    // IMPORTANT: Date should be April 1st of the financial year start, not today!
    const financialYearDate = new Date(
      `${financialYearStart}-04-01T00:00:00.000Z`
    );

    console.log(`📊 Financial Year: ${fy}`);
    console.log(`🆔 Counter ID: ${counterId}`);
    console.log(`📅 Correct date (April 1st): ${financialYearDate}\n`);

    // Check current counter
    const currentCounter = await countersCollection.findOne({ _id: counterId });
    console.log(`🔢 Current counter:`, currentCounter);

    if (!currentCounter) {
      console.log("\n❌ Counter not found! Creating new one...");
      await countersCollection.insertOne({
        _id: counterId,
        sequence: 5,
        date: financialYearDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✅ Counter created!");
    } else {
      console.log("\n✅ Updating counter date to April 1st of FY...");
      await countersCollection.updateOne(
        { _id: counterId },
        {
          $set: {
            date: financialYearDate,
            updatedAt: new Date(),
          },
        }
      );
      console.log("✅ Counter date fixed!");
    }

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

fixCounterDate();
