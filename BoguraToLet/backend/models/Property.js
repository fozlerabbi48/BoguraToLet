// backend/models/Property.js
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Property category is required'],
      enum: [
        'Family House',
        'Flat Rent',
        'Bachelor Room',
        'Sublet',
        'Hostel / Mess',
        'Shop Rent',
        'Office Rent',
        'Commercial Space',
        'Other Rental Properties',
      ],
      index: true,
    },
    rent: {
      type: Number,
      required: [true, 'Monthly rent is required'],
      min: [0, 'Rent cannot be negative'],
      index: true,
    },
    advancePayment: { type: Number, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    bedrooms: { type: Number, default: 1, min: 0 },
    bathrooms: { type: Number, default: 1, min: 0 },
    balconies: { type: Number, default: 0, min: 0 },
    floorNo: { type: Number, default: 1 },
    totalFloors: { type: Number, default: 1 },
    isFurnished: { type: Boolean, default: false },
    hasParking: { type: Boolean, default: false },
    gasType: {
      type: String,
      enum: ['Line Gas', 'Cylinder', 'None'],
      default: 'None',
    },
    electricityType: {
      type: String,
      enum: ['Prepaid', 'Postpaid', 'Included in Rent'],
      default: 'Prepaid',
    },
    waterSupply: {
      type: String,
      enum: ['24 Hours', 'Specific Times', 'Motor Pump'],
      default: '24 Hours',
    },
    tenantPreference: {
      type: String,
      enum: ['Family Only', 'Bachelor Only', 'Male Bachelor', 'Female Bachelor', 'Any'],
      default: 'Any',
      index: true,
    },
    availableFrom: {
      type: Date,
      required: [true, 'Available from date is required'],
    },
    contactPhone: {
      type: String,
      required: [true, 'Contact phone is required'],
    },
    // লোকেশন রেফারেন্স
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Division',
      required: true,
      index: true,
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true,
      index: true,
    },
    upazila: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upazila',
      required: true,
      index: true,
    },
    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Area',
      required: true,
      index: true,
    },
    addressDetails: {
      type: String,
      required: [true, 'Specific address/road number is required'],
    },
    // Cloudinary Images (সর্বোচ্চ ১৫টি ছবি)
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        isCover: { type: Boolean, default: false },
      },
    ],
    // বিজ্ঞাপন মালিক
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // স্ট্যাটাস
    status: {
      type: String,
      enum: ['active', 'pending', 'rented', 'rejected', 'hidden'],
      default: 'active', // অ্যাডমিন অনুমোদন লাগলে 'pending' করা যাবে
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// টেক্সট সার্চ ইনডেক্স
propertySchema.index({ title: 'text', description: 'text' });

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;
