const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  createProperty,
  getProperties,
  getPropertyById,
  updatePropertyStatus,
  getMyProperties,
  getAdminProperties,
  deleteProperty,
} = propertyController;

// পাবলিক
router.get('/', getProperties);

// নির্দিষ্ট পাথগুলো অবশ্যই '/:id' এর আগে থাকতে হবে
router.get('/my/listings', protect, getMyProperties);
router.get('/admin/all', protect, authorize('Super Admin', 'Admin'), getAdminProperties);

router.get('/:id', getPropertyById);

// protect আগে, তারপর upload (FormData পার্স করে req.body বানায়), তারপর controller
router.post('/', protect, upload.array('images', 8), createProperty);

router.patch('/:id/status', protect, updatePropertyStatus);
router.delete('/:id', protect, deleteProperty);

module.exports = router;