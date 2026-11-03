const { Conversation, Message } = require('../models/Chat');

// ১. কনভারসেশন তৈরি বা খোঁজা (POST /api/v1/chat/conversations)
exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const { receiverId, propertyId } = req.body;
    const senderId = req.user.id || req.user._id;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Receiver ID is required' });
    }

    if (receiverId.toString() === senderId.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot start conversation with yourself' });
    }

    const query = {
      participants: { $all: [senderId, receiverId] },
    };
    if (propertyId) {
      query.property = propertyId;
    }

    let conversation = await Conversation.findOne(query)
      .populate('participants', 'name email phone avatar role')
      .populate('property', 'title rent price images');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        property: propertyId || null,
      });
      conversation = await conversation.populate('participants', 'name email phone avatar role');
      if (propertyId) {
        conversation = await conversation.populate('property', 'title rent price images');
      }
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

// ২. ইউজারের কনভারসেশন লিস্ট (GET /api/v1/chat/conversations)
exports.getMyConversations = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name email phone avatar role')
      .populate('property', 'title rent price images')
      .populate('lastMessage.sender', 'name')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: conversations.length, data: conversations });
  } catch (error) {
    next(error);
  }
};

// ৩. মেসেজ পাঠানো (POST /api/v1/chat/messages)
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, receiverId, text, image } = req.body;
    const senderId = req.user.id || req.user._id;

    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'conversationId is required' });
    }

    if (!text && !image?.url) {
      return res.status(400).json({ success: false, message: 'Message text or image is required' });
    }

    // conversation থেকে receiverId বের করা (যদি বডিতে না পাঠানো হয়)
    let targetReceiverId = receiverId;
    if (!targetReceiverId) {
      const conv = await Conversation.findById(conversationId);
      if (!conv) {
        return res.status(404).json({ success: false, message: 'Conversation not found' });
      }
      targetReceiverId = conv.participants.find(p => p.toString() !== senderId.toString());
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: targetReceiverId,
      text: text || '',
      image: image || { url: '', publicId: '' },
      seen: false,
    });

    await message.populate('sender', 'name avatar role');

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        text: text || '📷 Photo',
        sender: senderId,
        createdAt: message.createdAt,
        seen: false,
      },
      updatedAt: new Date(),
    });

    // সকেটে রিয়েল-টাইম ব্রডকাস্ট
    if (req.io) {
      req.io.to(conversationId.toString()).emit('receiveMessage', message);
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

// ৪. চ্যাট মেসেজ হিস্ট্রি (GET /api/v1/chat/messages/:conversationId)
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id || req.user._id;

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: 1 });

    // না দেখা মেসেজগুলোতে Seen মার্ক দেওয়া
    await Message.updateMany(
      { conversation: conversationId, receiver: userId, seen: false },
      { seen: true, seenAt: new Date() }
    );

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    next(error);
  }
};
