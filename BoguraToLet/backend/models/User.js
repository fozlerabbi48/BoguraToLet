// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // কুয়েরি করার সময় ডিফল্টভাবে পাসওয়ার্ড আসবে না
    },
    role: {
      type: String,
      enum: ['Super Admin', 'Admin', 'Moderator', 'Property Owner', 'User'],
      default: 'User',
      index: true,
    },
    profileImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    isVerified: {
      type: Boolean,
      default: false, // ভেরিফায়েড ওনার ব্যাজের জন্য
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned'],
      default: 'active',
      index: true,
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// পাসওয়ার্ড সেভ করার আগে হ্যাশ করা (Mongoose আধুনিক ভার্সনের জন্য)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
// পাসওয়ার্ড মেলানোর মেথড
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// মডেল তৈরি ও এক্সপোর্ট
const User = mongoose.model('User', userSchema);
module.exports = User;
