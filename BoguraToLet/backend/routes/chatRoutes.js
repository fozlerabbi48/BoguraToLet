// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const {
  getOrCreateConversation,
  getMyConversations,
  sendMessage,
  getMessages,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // সব চ্যাট রুট সুরক্ষায় ঢাকা

router.post('/conversations', getOrCreateConversation);
router.get('/conversations', getMyConversations);
router.post('/messages', sendMessage);
router.get('/messages/:conversationId', getMessages);

module.exports = router;
