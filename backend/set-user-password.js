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
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Get password from command line argument
const phone = process.argv[2];
const newPassword = process.argv[3];

if (!phone || !newPassword) {
  console.log('\n❌ Usage: node set-user-password.js <phone> <password>');
  console.log('Example: node set-user-password.js 7088970099 MyPassword123\n');
  process.exit(1);
}

async function setUserPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ phone });
    
    if (!user) {
      console.log(`❌ User with phone ${phone} not found`);
      process.exit(1);
    }

    console.log(`\n📋 Found user: ${user.name} (${user.email})`);

    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    user.password = hashedPassword;
    await user.save();

    console.log(`\n✅ Password set successfully for ${user.name}!`);
    console.log(`\n🔑 You can now login with:`);
    console.log(`   Phone/Email: ${user.phone} or ${user.email}`);
    console.log(`   Password: ${newPassword}`);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setUserPassword();
