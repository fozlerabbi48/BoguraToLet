// backend/controllers/locationController.js
const { Division, District, Upazila, Area } = require('../models/Location');

// @desc    Get all divisions
// @route   GET /api/v1/locations/divisions
const getDivisions = async (req, res, next) => {
  try {
    const divisions = await Division.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: divisions.length, data: divisions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get districts (optionally by division)
// @route   GET /api/v1/locations/districts?divisionId=...
const getDistricts = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.divisionId) query.division = req.query.divisionId;

    const districts = await District.find(query).populate('division', 'name').sort({ name: 1 });
    res.status(200).json({ success: true, count: districts.length, data: districts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upazilas by district
// @route   GET /api/v1/locations/upazilas?districtId=...
const getUpazilas = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.districtId) query.district = req.query.districtId;

    const upazilas = await Upazila.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, count: upazilas.length, data: upazilas });
  } catch (error) {
    next(error);
  }
};

// @desc    Get areas by upazila
// @route   GET /api/v1/locations/areas?upazilaId=...
const getAreas = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.upazilaId) query.upazila = req.query.upazilaId;

    const areas = await Area.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, count: areas.length, data: areas });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new area (Admin / Super Admin only)
// @route   POST /api/v1/locations/areas
const createArea = async (req, res, next) => {
  try {
    const { name, bnName, upazilaId, districtId } = req.body;
    const area = await Area.create({
      name,
      bnName,
      upazila: upazilaId,
      district: districtId,
    });
    res.status(201).json({ success: true, message: 'Area added successfully', data: area });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDivisions,
  getDistricts,
  getUpazilas,
  getAreas,
  createArea,
};
