// backend/middleware/uploadMiddleware.js
const multer = require('multer');

// মেমোরি স্টোরেজ ব্যবহার করব যেন সরাসরি Cloudinary-তে স্ট্রিম/আপলোড করা যায়
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // প্রতি ছবি সর্বোচ্চ ৫ এমবি
    files: 15, // সর্বোচ্চ ১৫টি ছবি
  },
  fileFilter,
});

module.exports = upload;
