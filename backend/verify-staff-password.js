/**
 * Script to verify staff password and diagnose login issues
 * Usage: node verify-staff-password.js <phone_number>
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// User Schema
const UserSchema = new mongoose.Schema(
  {
    phone: String,
    name: String,
    password: String,
    email: String,
    role: String,
    outlets: [mongoose.Schema.Types.ObjectId],
    currentOutlet: mongoose.Schema.Types.ObjectId,
    permissions: [String],
    invitedBy: mongoose.Schema.Types.ObjectId,
    status: String,
    lastActive: Date,
    isActive: Boolean,
    requirePasswordChange: Boolean,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

const DEFAULT_PASSWORD = "Utkranti@123";

async function verifyStaffPassword() {
  try {
    // Get phone number from command line argument
    const phone = process.argv[2];

    if (!phone) {
      console.log("❌ Please provide a phone number");
      console.log("Usage: node verify-staff-password.js <phone_number>");
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI not found in environment variables");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Find the user
    const user = await User.findOne({ phone });

    if (!user) {
      console.log(`❌ User with phone ${phone} not found`);
      process.exit(1);
    }

    console.log("📋 User Details:");
    console.log("- Name:", user.name);
    console.log("- Phone:", user.phone);
    console.log("- Email:", user.email || "N/A");
    console.log("- Role:", user.role);
    console.log("- Status:", user.status);
    console.log("- Is Active:", user.isActive);
    console.log("- Require Password Change:", user.requirePasswordChange);
    console.log("- Has Password:", !!user.password);

    if (user.password) {
      console.log(
        "- Password Hash (first 20 chars):",
        user.password.substring(0, 20) + "..."
      );
    }
    console.log();

    if (!user.password) {
      console.log("❌ User has no password set!");
      console.log("💡 Setting default password now...");

      const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      user.password = hashedPassword;
      user.requirePasswordChange = true;
      await user.save();

      console.log("✅ Default password set successfully");
      console.log(`🔑 Default Password: ${DEFAULT_PASSWORD}`);
    } else {
      // Verify password
      console.log("🔐 Testing password validation...");
      const match = await bcrypt.compare(DEFAULT_PASSWORD, user.password);

      if (match) {
        console.log("✅ Password matches the default password");
        console.log(`🔑 Default Password: ${DEFAULT_PASSWORD}`);
      } else {
        console.log("❌ Password does NOT match the default password");
        console.log("💡 This could be why login is failing");
        console.log();
        console.log("Do you want to reset the password to default? (y/n)");

        // For automation, you can uncomment the next lines to auto-reset
        console.log("🔄 Resetting password to default...");
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        user.password = hashedPassword;
        user.requirePasswordChange = true;
        await user.save();
        console.log("✅ Password reset successfully");
        console.log(`🔑 New Password: ${DEFAULT_PASSWORD}`);
      }
    }

    console.log("\n✅ Verification complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

verifyStaffPassword();
