require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-pos';

const UserSchema = new mongoose.Schema({
  phone: String,
  name: String,
  email: String,
  password: String,
  role: String,
  permissions: [String],
  outlets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Outlet' }],
  currentOutlet: { type: mongoose.Schema.Types.ObjectId, ref: 'Outlet' },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String,
  lastActive: Date,
  isActive: Boolean,
  requirePasswordChange: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

const DEFAULT_PASSWORD = 'Utkranti@123';
const PRIMARY_ADMIN_PHONE = '7088970099';

async function setDefaultPasswords() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Hash the default password
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // Find all users except primary admin
    const users = await User.find({
      phone: { $ne: PRIMARY_ADMIN_PHONE },
      isActive: true
    });

    console.log(`📋 Found ${users.length} users (excluding primary admin)\n`);

    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      // Set default password and mark for password change requirement
      user.password = hashedPassword;
      user.requirePasswordChange = true;
      await user.save();
      
      console.log(`✅ Updated: ${user.name} (${user.phone}) - Role: ${user.role}`);
      updated++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated} users`);
    console.log(`   Skipped: ${skipped} users`);
    console.log(`\n🔑 Default Password: ${DEFAULT_PASSWORD}`);
    console.log(`   All users (except primary admin) must change password on first login\n`);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setDefaultPasswords();
