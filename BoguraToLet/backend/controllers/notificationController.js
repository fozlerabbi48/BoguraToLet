const Notification = require('../models/Notification');

// ১. ইউজারের নোটিফিকেশন লিস্ট লোড (পেইজিনেশনসহ)
exports.getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'name avatar role')
      .populate('property', 'title rent images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      total,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// ২. আনরিড নোটিফিকেশন সংখ্যা দেখা
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const count = await Notification.countDocuments({ recipient: userId, isRead: false });

    res.status(200).json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

// ৩. একটি নির্দিষ্ট নোটিফিকেশন Seen/Read মার্ক করা
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Marked as read', data: notification });
  } catch (error) {
    next(error);
  }
};

// ৪. সব নোটিফিকেশন এক ক্লিকে Read মার্ক করা
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// ৫. নোটিফিকেশন ডিলিট করা
exports.deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({ _id: id, recipient: userId });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};
