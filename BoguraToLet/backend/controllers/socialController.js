const { Reaction, Comment, Bookmark, Report } = require('../models/Social');
const Property = require('../models/Property');
const { sendNotification } = require('../utils/notify');

// ================= REACTION SYSTEM =================
// @desc    Toggle or update reaction on a property
// @route   POST /api/v1/social/properties/:id/react
const reactToProperty = async (req, res, next) => {
  try {
    const { type = 'Like' } = req.body;
    const propertyId = req.params.id;
    const userId = req.user._id || req.user.id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const existingReaction = await Reaction.findOne({ property: propertyId, user: userId });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // একই রিঅ্যাকশন আবার চাপলে রিমুভ (Toggle)
        await existingReaction.deleteOne();
        return res.status(200).json({ success: true, message: 'Reaction removed', action: 'removed' });
      } else {
        // রিঅ্যাকশন পরিবর্তন (যেমন Like থেকে Love)
        existingReaction.type = type;
        await existingReaction.save();
        return res.status(200).json({ success: true, message: 'Reaction updated', action: 'updated', data: existingReaction });
      }
    }

    const newReaction = await Reaction.create({ property: propertyId, user: userId, type });

    // ওনারকে নোটিফিকেশন পাঠানো (যদি নিজের পোস্টে নিজে রিয়্যাক্ট না করে)
    if (property.owner && property.owner.toString() !== userId.toString()) {
      await sendNotification({
        io: req.io,
        recipient: property.owner,
        sender: userId,
        type: 'reaction',
        title: 'New Reaction',
        message: `${req.user.name || 'Someone'} reacted with ${type} to your property`,
        property: propertyId,
        link: `/properties/${propertyId}`,
      });
    }

    res.status(201).json({ success: true, message: 'Reaction added', action: 'added', data: newReaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reactions summary and counts for a property
// @route   GET /api/v1/social/properties/:id/reactions
const getPropertyReactions = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const reactions = await Reaction.find({ property: propertyId }).populate('user', 'name profileImage');

    // রিঅ্যাকশন টাইপ অনুযায়ী কাউন্ট হিসাব
    const counts = { Like: 0, Love: 0, Haha: 0, Wow: 0, Sad: 0, Angry: 0, total: reactions.length };
    reactions.forEach((r) => {
      if (counts[r.type] !== undefined) counts[r.type]++;
    });

    res.status(200).json({ success: true, data: { counts, users: reactions } });
  } catch (error) {
    next(error);
  }
};

// ================= COMMENT SYSTEM =================
// @desc    Add comment or reply
// @route   POST /api/v1/social/properties/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { text, parentCommentId } = req.body;
    const propertyId = req.params.id;
    const userId = req.user._id || req.user.id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const comment = await Comment.create({
      property: propertyId,
      user: userId,
      text,
      parentComment: parentCommentId || null,
    });

    const populated = await comment.populate('user', 'name profileImage isVerified');

    // নোটিফিকেশন ট্রিগার
    if (parentCommentId) {
      // এটি একটি রিপ্লাই — মূল কমেন্টকারীকে নোটিফাই করা
      const parent = await Comment.findById(parentCommentId);
      if (parent && parent.user.toString() !== userId.toString()) {
        await sendNotification({
          io: req.io,
          recipient: parent.user,
          sender: userId,
          type: 'reply',
          title: 'New Reply',
          message: `${req.user.name || 'Someone'} replied to your comment`,
          property: propertyId,
          link: `/properties/${propertyId}`,
        });
      }
    } else {
      // এটি একটি মূল কমেন্ট — প্রোপার্টি ওনারকে নোটিফাই করা
      if (property.owner && property.owner.toString() !== userId.toString()) {
        await sendNotification({
          io: req.io,
          recipient: property.owner,
          sender: userId,
          type: 'comment',
          title: 'New Comment',
          message: `${req.user.name || 'Someone'} commented on your property listing`,
          property: propertyId,
          link: `/properties/${propertyId}`,
        });
      }
    }

    res.status(201).json({ success: true, message: 'Comment posted', data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a property
// @route   GET /api/v1/social/properties/:id/comments
const getPropertyComments = async (req, res, next) => {
  try {
    const propertyId = req.params.id;

    // মূল কমেন্টগুলো আনা
    const comments = await Comment.find({ property: propertyId, parentComment: null })
      .populate('user', 'name profileImage isVerified')
      .sort({ createdAt: -1 });

    // কমেন্টগুলোর রিপ্লাই আনা
    const commentIds = comments.map((c) => c._id);
    const replies = await Comment.find({ parentComment: { $in: commentIds } })
      .populate('user', 'name profileImage isVerified')
      .sort({ createdAt: 1 });

    // কমেন্টের ভেতর রিপ্লাইগুলো সাজানো
    const commentsWithReplies = comments.map((c) => {
      const commentObj = c.toObject();
      commentObj.replies = replies.filter((r) => r.parentComment.toString() === c._id.toString());
      return commentObj;
    });

    res.status(200).json({ success: true, count: comments.length, data: commentsWithReplies });
  } catch (error) {
    next(error);
  }
};

// ================= BOOKMARK SYSTEM =================
// @desc    Toggle Bookmark (Save / Unsave)
// @route   POST /api/v1/social/properties/:id/bookmark
const toggleBookmark = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user._id || req.user.id;

    const existing = await Bookmark.findOne({ property: propertyId, user: userId });
    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ success: true, message: 'Bookmark removed', isBookmarked: false });
    }

    await Bookmark.create({ property: propertyId, user: userId });
    res.status(201).json({ success: true, message: 'Property saved to bookmarks', isBookmarked: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookmarked properties
// @route   GET /api/v1/social/bookmarks/me
const getMyBookmarks = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const bookmarks = await Bookmark.find({ user: userId })
      .populate({
        path: 'property',
        populate: [{ path: 'area', select: 'name bnName' }, { path: 'district', select: 'name bnName' }],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookmarks.length, data: bookmarks.map((b) => b.property) });
  } catch (error) {
    next(error);
  }
};

// ================= REPORT SYSTEM =================
// @desc    Report an advertisement
// @route   POST /api/v1/social/properties/:id/report
const reportProperty = async (req, res, next) => {
  try {
    const { reason, details } = req.body;
    const report = await Report.create({
      property: req.params.id,
      reportedBy: req.user._id || req.user.id,
      reason,
      details,
    });

    res.status(201).json({ success: true, message: 'Report submitted for review', data: report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  reactToProperty,
  getPropertyReactions,
  addComment,
  getPropertyComments,
  toggleBookmark,
  getMyBookmarks,
  reportProperty,
};
