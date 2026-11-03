// backend/models/Social.js
const mongoose = require('mongoose');

// ১. Reaction Model (Like, Love, Haha, Wow, Sad, Angry)
const reactionSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['Like', 'Love', 'Haha', 'Wow', 'Sad', 'Angry'],
      default: 'Like',
    },
  },
  { timestamps: true }
);
// একজন ইউজার একটি বিজ্ঞাপনে সর্বোচ্চ একটি রিঅ্যাকশন দিতে পারবে
reactionSchema.index({ property: 1, user: 1 }, { unique: true });

// ২. Comment & Reply Model
const commentSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      trim: true,
    },
    // যদি কোনো কমেন্টের রিপ্লাই হয়, তবে parentComment থাকবে
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// ৩. Bookmark / Save Model
const bookmarkSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);
bookmarkSchema.index({ property: 1, user: 1 }, { unique: true });

// ৪. Report Model
const reportSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'Fake Advertisement',
        'Fraud',
        'Incorrect Information',
        'Inappropriate Content',
        'Suspicious Property Owner',
        'Other Issues',
      ],
      required: true,
    },
    details: {
      type: String,
      maxlength: [500, 'Details cannot exceed 500 characters'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

const Reaction = mongoose.model('Reaction', reactionSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
const Report = mongoose.model('Report', reportSchema);

module.exports = { Reaction, Comment, Bookmark, Report };
