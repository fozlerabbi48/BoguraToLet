const Notification = require('../models/Notification');
const { onlineUsers } = require('../sockets/chatSocket');

/**
 * নোটিফিকেশন ডাটাবেসে সেভ করে এবং প্রাপক অনলাইনে থাকলে Socket.IO দিয়ে লাইভ পাঠায়
 */
const sendNotification = async ({ io, recipient, sender, type, title, message, property, link }) => {
  try {
    // নিজের অ্যাকশনে নিজেকে নোটিফিকেশন পাঠানোর প্রয়োজন নেই
    if (recipient?.toString() === sender?.toString()) return null;

    const notif = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      property: property || null,
      link: link || '',
    });

    await notif.populate('sender', 'name avatar role');

    // Socket.IO দিয়ে অনলাইনে থাকা প্রাপককে পুশ করা
    if (io && onlineUsers) {
      const recipientSockets = onlineUsers.get(recipient.toString());
      if (recipientSockets) {
        recipientSockets.forEach((sockId) => {
          io.to(sockId).emit('newNotification', notif);
        });
      }
    }

    return notif;
  } catch (err) {
    console.error('[NOTIFY ERROR]:', err.message);
    return null;
  }
};

module.exports = { sendNotification };
