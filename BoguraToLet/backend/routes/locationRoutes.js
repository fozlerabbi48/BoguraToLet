// backend/routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDivisions,
  getDistricts,
  getUpazilas,
  getAreas,
  createArea,
} = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/divisions', getDivisions);
router.get('/districts', getDistricts);
router.get('/upazilas', getUpazilas);
router.get('/areas', getAreas);

// শুধু Admin এবং Super Admin নতুন এলাকা যোগ করতে পারবে
router.post('/areas', protect, authorize('Super Admin', 'Admin'), createArea);

module.exports = router;
