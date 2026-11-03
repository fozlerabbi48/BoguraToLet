const { Message, Conversation } = require('../models/Chat');

// অনলাইন ইউজারদের ট্র্যাক করার ম্যাপ (userId -> Set of socketIds)
const onlineUsers = new Map();

const initChatSocket = (io) => {
  io.on('connection', (socket) => {
    // ১. ইউজার কানেক্ট হলে নিজের ইউজার আইডি রেজিস্টার করবে
    socket.on('userConnected', (userId) => {
      if (!userId) return;
      const uId = userId.toString();

      if (!onlineUsers.has(uId)) {
        onlineUsers.set(uId, new Set());
      }
      onlineUsers.get(uId).add(socket.id);
      socket.userId = uId;

      io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
      console.log(`[CHAT SOCKET] User ${uId} is ONLINE`);
    });

    // ২. নির্দিষ্ট চ্যাট রুমে জয়েন করা
    socket.on('joinConversation', (conversationId) => {
      if (conversationId) {
        socket.join(conversationId.toString());
      }
    });

    // ৩. রিয়েল-টাইম মেসেজ পাঠানো ও ডাটাবেসে সেভ
    socket.on('sendMessage', async ({ conversationId, senderId, receiverId, text, image }) => {
      try {
        if (!conversationId || !senderId || !receiverId || (!text && !image?.url)) {
          return socket.emit('error', { message: 'Invalid message payload' });
        }

        // মেসেজ তৈরি
        const newMsg = await Message.create({
          conversation: conversationId,
          sender: senderId,
          receiver: receiverId,
          text: text || '',
          image: image || { url: '', publicId: '' },
          seen: false,
        });

        await newMsg.populate('sender', 'name avatar role');

        // Conversation-এর lastMessage অবজেক্ট আপডেট
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            text: text || '📷 Photo',
            sender: senderId,
            createdAt: newMsg.createdAt,
            seen: false,
          },
          updatedAt: new Date(),
        });

        // রুমে থাকা সবাইকে পাঠানো
        io.to(conversationId.toString()).emit('receiveMessage', newMsg);

        // রিসিভারকে সরাসরি ইভেন্ট পাঠানো (যদি অন্য পেজে থাকে)
        const receiverSockets = onlineUsers.get(receiverId.toString());
        if (receiverSockets) {
          receiverSockets.forEach((sockId) => {
            io.to(sockId).emit('newMessageNotification', {
              conversationId,
              message: newMsg,
            });
          });
        }
      } catch (error) {
        console.error('[SOCKET ERROR] sendMessage failed:', error.message);
        socket.emit('error', { message: error.message });
      }
    });

    // ৪. টাইপিং ইন্ডিকেটর
    socket.on('typing', ({ conversationId, receiverId, senderName }) => {
      if (conversationId) {
        socket.to(conversationId.toString()).emit('userTyping', { conversationId, senderName });
      }
      if (receiverId) {
        const receiverSockets = onlineUsers.get(receiverId.toString());
        if (receiverSockets) {
          receiverSockets.forEach((sockId) => {
            io.to(sockId).emit('userTyping', { conversationId, senderName });
          });
        }
      }
    });

    socket.on('stopTyping', ({ conversationId, receiverId }) => {
      if (conversationId) {
        socket.to(conversationId.toString()).emit('userStoppedTyping', { conversationId });
      }
      if (receiverId) {
        const receiverSockets = onlineUsers.get(receiverId.toString());
        if (receiverSockets) {
          receiverSockets.forEach((sockId) => {
            io.to(sockId).emit('userStoppedTyping', { conversationId });
          });
        }
      }
    });

    // ৫. মেসেজ সিন (seen) ইভেন্ট এবং DB আপডেট
    socket.on('markAsSeen', async ({ conversationId, readerId, senderId }) => {
      try {
        if (!conversationId || !readerId) return;

        // মেসেজ আপডেট
        await Message.updateMany(
          { conversation: conversationId, receiver: readerId, seen: false },
          { seen: true, seenAt: new Date() }
        );

        // কনভারসেশনের lastMessage যদি reader-এর উদ্দেশ্যে হয়ে থাকে
        await Conversation.updateOne(
          { _id: conversationId, 'lastMessage.sender': { $ne: readerId } },
          { $set: { 'lastMessage.seen': true } }
        );

        // মূল সেন্ডারকে জানানো যে মেসেজ পড়া হয়েছে
        if (senderId) {
          const senderSockets = onlineUsers.get(senderId.toString());
          if (senderSockets) {
            senderSockets.forEach((sockId) => {
              io.to(sockId).emit('messagesSeen', { conversationId, seenBy: readerId });
            });
          }
        }
        socket.to(conversationId.toString()).emit('messagesSeen', { conversationId, seenBy: readerId });
      } catch (error) {
        console.error('[SOCKET ERROR] markAsSeen failed:', error.message);
      }
    });

    // ৬. ডিসকানেক্ট হ্যান্ডলিং
    socket.on('disconnect', () => {
      if (socket.userId && onlineUsers.has(socket.userId)) {
        const userSockets = onlineUsers.get(socket.userId);
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(socket.userId);
          io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
          console.log(`[CHAT SOCKET] User ${socket.userId} went OFFLINE`);
        }
      }
    });
  });
};

module.exports = { initChatSocket, onlineUsers };
