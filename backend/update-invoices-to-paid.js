const mongoose = require("mongoose");
require("dotenv").config();

const invoiceSchema = new mongoose.Schema({}, { strict: false });
const Invoice = mongoose.model("Invoice", invoiceSchema);

async function updateInvoicesToPaid() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant"
    );
    console.log("Connected to MongoDB");

    // Update all pending invoices to paid
    const result = await Invoice.updateMany(
      { paymentStatus: "pending" },
      {
        $set: {
          paymentStatus: "paid",
          paidAt: new Date(),
        },
        $setOnInsert: {
          paidAmount: 0, // Will be set correctly by the next operation
        },
      }
    );

    console.log(`Updated ${result.modifiedCount} invoices to paid status`);

    // Now update paidAmount to match total for all paid invoices that don't have it set
    const amountResult = await Invoice.updateMany(
      {
        paymentStatus: "paid",
        $or: [{ paidAmount: 0 }, { paidAmount: { $exists: false } }],
      },
      [
        {
          $set: {
            paidAmount: "$total",
          },
        },
      ]
    );

    console.log(
      `Updated paidAmount for ${amountResult.modifiedCount} invoices`
    );

    // Also update corresponding orders
    const Order = mongoose.model(
      "Order",
      new mongoose.Schema({}, { strict: false })
    );
    const orderResult = await Order.updateMany(
      { paymentStatus: "pending" },
      { $set: { paymentStatus: "paid" } }
    );

    console.log(`Updated ${orderResult.modifiedCount} orders to paid status`);

    console.log(
      "\n✅ All invoices and orders have been updated to paid status!"
    );

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error updating invoices:", error);
    process.exit(1);
  }
}

updateInvoicesToPaid();
