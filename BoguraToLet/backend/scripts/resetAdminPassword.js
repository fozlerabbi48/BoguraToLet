require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const resetAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/boguratoo';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected...');

    const email = 'fozle.rabbipub48@gmail.com'; // আপনার ইমেইল
    const newPassword = 'YourNewPasswordHere!'; // <--- এখানে আপনার পছন্দের নতুন পাসওয়ার্ড দিন

    const user = await User.findOne({ email });

    if (!user) {
      console.log('Admin user found na! Agay seed run korun.');
      process.exit(1);
    }

    // পাসওয়ার্ড আপডেট ও হ্যাশ
    user.password = newPassword;
    user.role = 'Super Admin';
    await user.save();

    console.log('✅ Admin password successfully updated!');
    console.log(`Email: ${email}`);
    console.log(`New Password: ${newPassword}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to reset:', err.message);
    process.exit(1);
  }
};

resetAdmin();
