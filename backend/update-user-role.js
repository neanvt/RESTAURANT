require("dotenv").config();
const mongoose = require("mongoose");

// Connect to MongoDB
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant-pos";

const UserSchema = new mongoose.Schema(
  {
    phone: String,
    name: String,
    email: String,
    password: String,
    role: String,
    permissions: [String],
    outlets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Outlet" }],
    currentOutlet: { type: mongoose.Schema.Types.ObjectId, ref: "Outlet" },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: String,
    lastActive: Date,
    isActive: Boolean,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

async function updateUserRole() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const user = await User.findOne({ phone: "7088970099" });

    if (!user) {
      console.log("❌ User not found");
      process.exit(1);
    }

    console.log("\n📋 Current user data:");
    console.log({
      id: user._id.toString(),
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
      outlets: user.outlets,
    });

    // Update role to primary_admin
    user.role = "primary_admin";
    user.permissions = [
      "manage_items",
      "manage_orders",
      "manage_customers",
      "view_reports",
      "manage_staff",
      "manage_outlets",
      "manage_expenses",
      "manage_inventory",
    ];

    await user.save();

    console.log("\n✅ User role updated successfully!");
    console.log("New role:", user.role);
    console.log("Permissions:", user.permissions);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

updateUserRole();
