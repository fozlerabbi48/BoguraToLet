const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // একজন ব্যবহারকারীর একটিই সক্রিয় ভেরিফিকেশন প্রোফাইল থাকবে
    },
    nidNumber: {
      type: String,
      required: [true, 'NID number is required'],
      trim: true,
    },
    nidFrontImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    nidBackImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    holdingTaxDoc: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Verification', verificationSchema);
