const mongoose = require("mongoose");
require("dotenv").config();

async function checkOrders() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const Order = mongoose.model(
      "Order",
      new mongoose.Schema({}, { strict: false, collection: "orders" })
    );
    const Counter = mongoose.model(
      "Counter",
      new mongoose.Schema({}, { strict: false, collection: "counters" })
    );

    // Get all orders from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log("📋 Orders created today:");
    const orders = await Order.find({
      createdAt: { $gte: today },
    }).sort({ createdAt: 1 });

    orders.forEach((order, index) => {
      console.log(
        `${index + 1}. Order Number: ${order.orderNumber}, Outlet: ${
          order.outletId
        }, Created: ${order.createdAt}`
      );
    });

    console.log(`\nTotal orders today: ${orders.length}\n`);

    // Check counters
    console.log("🔢 Current counters:");
    const counters = await Counter.find({});
    counters.forEach((counter) => {
      console.log(
        `Counter ID: ${counter._id}, Count: ${counter.count}, Date: ${
          counter.date || "N/A"
        }`
      );
    });

    // Check for duplicates
    console.log("\n🔍 Checking for duplicate order numbers:");
    const orderNumbers = orders.map((o) => o.orderNumber);
    const duplicates = orderNumbers.filter(
      (item, index) => orderNumbers.indexOf(item) !== index
    );

    if (duplicates.length > 0) {
      console.log("⚠️ Found duplicates:", duplicates);
    } else {
      console.log("✅ No duplicates found");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkOrders();
