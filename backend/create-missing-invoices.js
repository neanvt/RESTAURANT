/**
 * Migration script to create invoices for completed orders that don't have invoices
 * This fixes the issue where only 17 invoices exist for 47 orders
 */

const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const Order = require("./dist/models/Order").default;
const Invoice = require("./dist/models/Invoice").default;
const Counter = require("./dist/models/Counter").default;

async function generateInvoiceNumber(outletId) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  // Get the current financial year (Apr-Mar)
  const currentMonth = today.getMonth(); // 0-11
  const fiscalYearStart = currentMonth >= 3 ? year : year - 1; // April is month 3 (0-indexed)
  const fiscalYearEnd = fiscalYearStart + 1;
  const fiscalYearShort = `${String(fiscalYearStart).slice(2)}-${String(
    fiscalYearEnd
  ).slice(2)}`;

  const counterId = `invoice-${outletId}-${year}-${month}-${day}`;
  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const paddedNumber = String(counter.seq).padStart(3, "0");
  return `${paddedNumber}/${fiscalYearShort}`;
}

async function createMissingInvoices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all completed orders
    const completedOrders = await Order.find({
      status: "completed",
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    }).populate("outlet");

    console.log(`Found ${completedOrders.length} completed orders`);

    let invoicesCreated = 0;
    let invoicesExisted = 0;
    let errors = 0;

    for (const order of completedOrders) {
      try {
        // Check if invoice already exists for this order
        const existingInvoice = await Invoice.findOne({
          order: order._id,
          $or: [{ isActive: true }, { isActive: { $exists: false } }],
        });

        if (existingInvoice) {
          console.log(
            `Invoice already exists for order ${order.orderNumber}: ${existingInvoice.invoiceNumber}`
          );
          invoicesExisted++;
          continue;
        }

        // Generate invoice number
        const invoiceNumber = await generateInvoiceNumber(order.outlet._id);

        // Create the invoice
        const invoice = new Invoice({
          invoiceNumber,
          order: order._id,
          outlet: order.outlet._id,
          customer: order.customer,
          items: order.items.map((item) => ({
            item: item.item,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
          })),
          subtotal: order.subtotal,
          tax: order.tax,
          discount: order.discount,
          total: order.total,
          paymentMethod: order.paymentMethod || "cash",
          paymentStatus: order.paymentStatus || "paid",
          paidAt: order.paidAt || order.completedAt || new Date(),
          isActive: true,
        });

        await invoice.save();

        console.log(
          `✓ Created invoice ${invoiceNumber} for order ${order.orderNumber}`
        );
        invoicesCreated++;
      } catch (error) {
        console.error(
          `✗ Error creating invoice for order ${order.orderNumber}:`,
          error.message
        );
        errors++;
      }
    }

    console.log("\n=== Summary ===");
    console.log(`Total completed orders: ${completedOrders.length}`);
    console.log(`Invoices already existed: ${invoicesExisted}`);
    console.log(`Invoices created: ${invoicesCreated}`);
    console.log(`Errors: ${errors}`);

    // Verify final counts
    const finalInvoiceCount = await Invoice.countDocuments({
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    });
    const finalOrderCount = await Order.countDocuments({
      status: "completed",
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    });

    console.log("\n=== Final Counts ===");
    console.log(`Total invoices: ${finalInvoiceCount}`);
    console.log(`Total completed orders: ${finalOrderCount}`);

    await mongoose.connection.close();
    console.log("\nMongoDB connection closed");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
createMissingInvoices();
