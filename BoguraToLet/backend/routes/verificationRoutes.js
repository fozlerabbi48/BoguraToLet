const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { protect } = require('../middleware/authMiddleware');

// অ্যাডমিন মিডলওয়্যার চেক
const requireAdmin = (req, res, next) => {
  if (req.user && ['Super Admin', 'Admin'].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required' });
};

router.use(protect); // সব রুট সুরক্ষিত

// সাধারণ ইউজার / ওনার রুট
router.post('/submit', verificationController.submitVerification);
router.get('/status', verificationController.getMyVerificationStatus);

// অ্যাডমিন রুট
router.get('/admin/requests', requireAdmin, verificationController.getAllVerifications);
router.patch('/admin/review/:id', requireAdmin, verificationController.reviewVerification);

module.exports = router;
