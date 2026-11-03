// backend/models/Location.js
const mongoose = require('mongoose');

// ১. Division (বিভাগ)
const divisionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    bnName: { type: String, trim: true },
  },
  { timestamps: true }
);

// ২. District (জেলা)
const districtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    bnName: { type: String, trim: true },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Division',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);
districtSchema.index({ name: 1, division: 1 }, { unique: true });

// ৩. Upazila (উপজেলা)
const upazilaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    bnName: { type: String, trim: true },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);
upazilaSchema.index({ name: 1, district: 1 }, { unique: true });

// ৪. Area / Locality (এলাকা / মহল্লা)
const areaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    bnName: { type: String, trim: true },
    upazila: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upazila',
      required: true,
      index: true,
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);
areaSchema.index({ name: 1, upazila: 1 }, { unique: true });

const Division = mongoose.model('Division', divisionSchema);
const District = mongoose.model('District', districtSchema);
const Upazila = mongoose.model('Upazila', upazilaSchema);
const Area = mongoose.model('Area', areaSchema);

module.exports = { Division, District, Upazila, Area };
