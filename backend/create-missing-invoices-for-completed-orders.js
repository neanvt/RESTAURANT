/**
 * Migration Script: Create invoices for completed orders without invoices
 * Run with: node create-missing-invoices-for-completed-orders.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

// Define schemas
const OrderSchema = new mongoose.Schema({
  outletId: mongoose.Types.ObjectId,
  orderNumber: String,
  items: Array,
  subtotal: Number,
  taxAmount: Number,
  total: Number,
  status: String,
  paymentStatus: String,
  paymentMethod: String,
  customer: Object,
  isActive: Boolean,
  createdBy: mongoose.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date,
});

const InvoiceSchema = new mongoose.Schema({
  outletId: mongoose.Types.ObjectId,
  orderId: mongoose.Types.ObjectId,
  invoiceNumber: String,
  items: Array,
  subtotal: Number,
  taxAmount: Number,
  total: Number,
  customer: Object,
  paymentMethod: String,
  paymentStatus: String,
  paidAmount: Number,
  isActive: Boolean,
  createdBy: mongoose.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date,
  paidAt: Date,
});

const CounterSchema = new mongoose.Schema({
  outletId: mongoose.Types.ObjectId,
  name: String,
  value: Number,
  financialYear: String,
  date: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);
const Invoice = mongoose.model("Invoice", InvoiceSchema);
const Counter = mongoose.model("Counter", CounterSchema);

// Generate invoice number
const generateInvoiceNumber = async (outletId) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const financialYearStart = month < 4 ? year - 1 : year;
  const financialYearEnd = financialYearStart + 1;
  const financialYear = `${financialYearStart}-${financialYearEnd
    .toString()
    .slice(-2)}`;
  const dateStr = today.toISOString().split("T")[0];

  const counter = await Counter.findOneAndUpdate(
    {
      outletId,
      name: "invoice",
      financialYear,
      date: dateStr,
    },
    {
      $inc: { value: 1 },
      $setOnInsert: {
        outletId,
        name: "invoice",
        financialYear,
        date: dateStr,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  const paddedNumber = counter.value.toString().padStart(3, "0");
  return `${paddedNumber}/${financialYear.split("-").join("-")}`;
};

async function createMissingInvoices() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all completed orders
    const completedOrders = await Order.find({
      status: "completed",
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    }).sort({ createdAt: 1 });

    console.log(`📦 Found ${completedOrders.length} completed orders\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const order of completedOrders) {
      try {
        // Check if invoice already exists
        const existingInvoice = await Invoice.findOne({ orderId: order._id });

        if (existingInvoice) {
          skipped++;
          continue;
        }

        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber(order.outletId);

        // Create invoice
        const invoice = new Invoice({
          outletId: order.outletId,
          orderId: order._id,
          invoiceNumber,
          items: order.items,
          subtotal: order.subtotal,
          taxAmount: order.taxAmount,
          total: order.total,
          customer: order.customer,
          paymentMethod: order.paymentMethod || "cash",
          paymentStatus: "paid",
          paidAmount: order.total,
          isActive: order.isActive !== false,
          createdBy: order.createdBy,
          createdAt: order.completedAt || order.updatedAt || order.createdAt,
          updatedAt: order.completedAt || order.updatedAt || order.createdAt,
          paidAt: order.completedAt || order.updatedAt || order.createdAt,
        });

        await invoice.save();
        created++;
        console.log(
          `✅ Created invoice ${invoiceNumber} for order ${order.orderNumber}`
        );
      } catch (error) {
        errors++;
        console.error(
          `❌ Failed to create invoice for order ${order.orderNumber}:`,
          error.message
        );
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   Created: ${created}`);
    console.log(`   Skipped (already exists): ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total processed: ${completedOrders.length}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

createMissingInvoices()
  .then(() => {
    console.log("\n✅ Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
