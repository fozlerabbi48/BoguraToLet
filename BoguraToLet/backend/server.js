const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

// পরিবেশের কনফিগ লোড
dotenv.config();

// এক্সপ্রেস অ্যাপ ও এইচটিটিপি সার্ভার
const app = express();
const server = http.createServer(app);

// সকেট আইও ইনিশিয়ালাইজ
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// গ্লোবাল সিকিউরিটি ও বডি পার্সার
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// রেট লিমিটিং
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', limiter);

// রিকোয়েস্ট অবজেক্টে সকেট ইনস্ট্যান্স রাখা
app.use((req, res, next) => {
  req.io = io;
  next();
});

// বেস ও হেলথ চেক রুট
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'Welcome to BoguraToLet API',
    version: '1.0.0',
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// ==================== API Routes ====================
const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const socialRoutes = require('./routes/socialRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const verificationRoutes = require('./routes/verificationRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/social', socialRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/verifications', verificationRoutes); // <--- সব রুটের সাথে 404 এর ওপরে

// ==================== 404 Route Handler ====================
// এটি অবশ্যই সব API Routes-এর নিচে থাকবে
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot find route: ${req.originalUrl}`,
  });
});
const path = require('path');
// uploads ফোল্ডারকে স্ট্যাটিক হিসেবে ওপেন করা
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// গ্লোবাল এরর হ্যান্ডলার
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// সকেট হ্যান্ডলার চালু
const { initChatSocket } = require('./sockets/chatSocket');
initChatSocket(io);

// ডাটাবেজ কানেকশন ও সার্ভার লিসেন
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/boguratoo';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`[INFO] MongoDB connected successfully to: ${MONGO_URI}`);
    server.listen(PORT, () => {
      console.log(`[INFO] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[ERROR] Database connection failed:', err.message);
    process.exit(1);
  });
