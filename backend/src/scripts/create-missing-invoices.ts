import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Order from "../models/Order";
import Invoice from "../models/Invoice";
import Counter from "../models/Counter";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function createMissingInvoices() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("✅ Connected to MongoDB");

    // Find all completed orders
    const completedOrders = await Order.find({
      status: "completed",
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    }).lean();

    console.log(`\n📊 Found ${completedOrders.length} completed orders`);

    // Check which orders already have invoices
    const orderIds = completedOrders.map((order) => order._id);
    const existingInvoices = await Invoice.find({
      orderId: { $in: orderIds },
    }).lean();

    const existingOrderIds = new Set(
      existingInvoices.map((inv) => inv.orderId.toString())
    );

    console.log(`📄 Found ${existingInvoices.length} existing invoices`);

    // Find orders without invoices
    const ordersWithoutInvoices = completedOrders.filter(
      (order) => !existingOrderIds.has(order._id.toString())
    );

    console.log(
      `\n🆕 Creating ${ordersWithoutInvoices.length} missing invoices...\n`
    );

    let created = 0;
    let failed = 0;

    for (const order of ordersWithoutInvoices) {
      try {
        // Generate invoice number for this outlet
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        const financialYearStart = month < 4 ? year - 1 : year;
        const financialYearEnd = financialYearStart + 1;
        const fy = `${financialYearStart.toString().slice(2)}/${financialYearEnd
          .toString()
          .slice(2)}`;

        const counter = await Counter.findOneAndUpdate(
          {
            outletId: order.outletId,
            type: "invoice",
            financialYear: fy,
          },
          {
            $inc: { sequence: 1 },
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );

        const invoiceNumber = `INV-${String(counter.sequence).padStart(
          3,
          "0"
        )}/${fy}`;

        // Create the invoice
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
          isActive: true,
          createdBy: order.createdBy,
          paidAt: order.completedAt || order.updatedAt,
          createdAt: order.completedAt || order.updatedAt,
          updatedAt: order.completedAt || order.updatedAt,
        });

        await invoice.save();
        created++;
        console.log(
          `✅ Created invoice ${invoiceNumber} for order ${order.orderNumber}`
        );
      } catch (error: any) {
        failed++;
        console.error(
          `❌ Failed to create invoice for order ${order.orderNumber}:`,
          error.message
        );
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Total completed orders: ${completedOrders.length}`);
    console.log(`   Existing invoices: ${existingInvoices.length}`);
    console.log(`   Invoices created: ${created}`);
    console.log(`   Failed: ${failed}`);
    console.log(`\n✅ Migration complete!`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

// Run the migration
createMissingInvoices();
