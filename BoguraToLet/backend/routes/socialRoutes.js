// backend/routes/socialRoutes.js
const express = require('express');
const router = express.Router();
const {
  reactToProperty,
  getPropertyReactions,
  addComment,
  getPropertyComments,
  toggleBookmark,
  getMyBookmarks,
  reportProperty,
} = require('../controllers/socialController');
const { protect } = require('../middleware/authMiddleware');

// রিঅ্যাকশন রুট
router.post('/properties/:id/react', protect, reactToProperty);
router.get('/properties/:id/reactions', getPropertyReactions);

// কমেন্ট ও রিপ্লাই রুট
router.post('/properties/:id/comments', protect, addComment);
router.get('/properties/:id/comments', getPropertyComments);

// বুকমার্ক রুট
router.post('/properties/:id/bookmark', protect, toggleBookmark);
router.get('/bookmarks/me', protect, getMyBookmarks);

// রিপোর্ট রুট
router.post('/properties/:id/report', protect, reportProperty);

module.exports = router;
