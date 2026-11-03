// backend/scripts/seedSuperAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/boguratoo';
    await mongoose.connect(mongoUri);
    console.log('[INFO] Connected to MongoDB for seeding...');

    // চেক করা ইতিমধ্যে Super Admin আছে কিনা
    const existingSuperAdmin = await User.findOne({ role: 'Super Admin' });
    if (existingSuperAdmin) {
      console.log(`[NOTICE] Super Admin already exists: ${existingSuperAdmin.email}`);
      process.exit(0);
    }

    // প্রথম Super Admin তৈরি (আপনার তথ্য অনুযায়ী এগুলো এডিট করতে পারেন)
    const superAdminData = {
      name: 'Fozle Rabbi',
      email: 'fozle.rabbipub48@gmail.com',
      phone: '01700000000', // আপনার আসল ফোন নম্বর দিতে পারেন
      password: 'AdminPassword123!', // প্রথমবার লগইনের পর এটি পরিবর্তন করে নেবেন
      role: 'Super Admin',
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      status: 'active',
      bio: 'Founder and Super Admin of BoguraToLet.com',
    };

    const superAdmin = await User.create(superAdminData);

    console.log('--------------------------------------------------');
    console.log('✅ Super Admin created successfully!');
    console.log(`   Name:  ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Role:  ${superAdmin.role}`);
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Seeding failed:', error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
