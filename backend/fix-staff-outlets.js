require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/restaurant-pos";

const UserSchema = new mongoose.Schema(
  {
    phone: String,
    name: String,
    role: String,
    outlets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Outlet" }],
    currentOutlet: { type: mongoose.Schema.Types.ObjectId, ref: "Outlet" },
    requirePasswordChange: Boolean,
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

async function fixStaffOutlets() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all staff users without currentOutlet
    const users = await User.find({
      role: { $in: ["staff", "waiter", "secondary_admin", "kitchen"] },
      outlets: { $exists: true, $ne: [] },
      $or: [{ currentOutlet: { $exists: false } }, { currentOutlet: null }],
    });

    console.log(`📋 Found ${users.length} users without currentOutlet\n`);

    for (const user of users) {
      if (user.outlets && user.outlets.length > 0) {
        // Set first outlet as current
        user.currentOutlet = user.outlets[0];
        await user.save();

        console.log(`✅ Set currentOutlet for: ${user.name} (${user.phone})`);
        console.log(`   Current Outlet: ${user.currentOutlet}`);
        console.log(
          `   Require Password Change: ${user.requirePasswordChange || false}\n`
        );
      }
    }

    console.log("✅ All done!");

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

fixStaffOutlets();
