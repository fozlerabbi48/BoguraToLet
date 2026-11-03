const Verification = require('../models/Verification');
const User = require('../models/User');
const { sendNotification } = require('../utils/notify');

// ১. মালিকের ভেরিফিকেশন রিকোয়েস্ট সাবমিট করা
exports.submitVerification = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { nidNumber, nidFrontImage, nidBackImage, holdingTaxDoc } = req.body;

    if (!nidNumber) {
      return res.status(400).json({ success: false, message: 'NID number is required' });
    }

    let verification = await Verification.findOne({ user: userId });

    if (verification && verification.status === 'verified') {
      return res.status(400).json({ success: false, message: 'You are already verified' });
    }

    if (verification) {
      // আগের রিজেক্টেড থাকলে পুনরায় আপডেট করে পেন্ডিং করা
      verification.nidNumber = nidNumber;
      if (nidFrontImage) verification.nidFrontImage = nidFrontImage;
      if (nidBackImage) verification.nidBackImage = nidBackImage;
      if (holdingTaxDoc) verification.holdingTaxDoc = holdingTaxDoc;
      verification.status = 'pending';
      verification.rejectionReason = '';
      await verification.save();
    } else {
      verification = await Verification.create({
        user: userId,
        nidNumber,
        nidFrontImage: nidFrontImage || { url: '', publicId: '' },
        nidBackImage: nidBackImage || { url: '', publicId: '' },
        holdingTaxDoc: holdingTaxDoc || { url: '', publicId: '' },
        status: 'pending',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification request submitted. Waiting for admin approval.',
      data: verification,
    });
  } catch (error) {
    next(error);
  }
};

// ২. নিজের ভেরিফিকেশন স্ট্যাটাস দেখা
exports.getMyVerificationStatus = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const verification = await Verification.findOne({ user: userId });

    res.status(200).json({
      success: true,
      status: verification ? verification.status : 'unverified',
      data: verification,
    });
  } catch (error) {
    next(error);
  }
};

// ================= ADMIN CONTROLS =================

// ৩. অ্যাডমিন: সব রিকোয়েস্ট দেখা (ফিল্টারিং সহ)
exports.getAllVerifications = async (req, res, next) => {
  try {
    const { status = 'pending', page = 1, limit = 20 } = req.query;

    const query = status ? { status } : {};

    const requests = await Verification.find(query)
      .populate('user', 'name email phone role isVerified createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Verification.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// ৪. অ্যাডমিন: ভেরিফিকেশন অনুমোদন (Approve) বা বাতিল (Reject)
exports.reviewVerification = async (req, res, next) => {
  try {
    const { id } = req.params; // Verification doc ID
    const { status, rejectionReason } = req.body; // 'verified' or 'rejected'
    const adminId = req.user._id || req.user.id;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'verified' or 'rejected'" });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const verification = await Verification.findById(id);
    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    verification.status = status;
    verification.reviewedBy = adminId;
    verification.reviewedAt = new Date();
    if (status === 'rejected') {
      verification.rejectionReason = rejectionReason;
    }
    await verification.save();

    // ইউজারের মূল একাউন্টে isVerified আপডেট করা
    const isUserVerified = status === 'verified';
    await User.findByIdAndUpdate(verification.user, { isVerified: isUserVerified });

    // ব্যবহারকারীকে নোটিফিকেশন পাঠানো
    await sendNotification({
      io: req.io,
      recipient: verification.user,
      sender: adminId,
      type: 'verification',
      title: status === 'verified' ? 'Identity Verified!' : 'Verification Rejected',
      message:
        status === 'verified'
          ? 'Congratulations! Your identity has been verified. You now have the Verified Owner badge.'
          : `Your verification was rejected: ${rejectionReason}`,
      link: '/profile',
    });

    res.status(200).json({
      success: true,
      message: `Verification ${status} successfully`,
      data: verification,
    });
  } catch (error) {
    next(error);
  }
};
