// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // ইউজার যাতে সরাসরি Super Admin বা Admin রোল দিয়ে রেজিস্টার করতে না পারে
    const assignedRole = role === 'Property Owner' ? 'Property Owner' : 'User';

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email or phone number already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: assignedRole,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    User Login (Email or Phone)
// @route   POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { login, password } = req.body;

    // ইমেইল বা ফোন যে কোনো একটি দিয়ে লগইন সাপোর্ট
    const user = await User.findOne({
      $or: [{ email: login.toLowerCase() }, { phone: login }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.status}. Contact support.`,
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
