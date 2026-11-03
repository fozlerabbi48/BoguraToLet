const express = require('express');
const mongoose = require('mongoose');
const { sendSuccess } = require('../utils/apiResponse');

const router = express.Router();

// Health check: GET /api/v1/health
router.get('/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  sendSuccess(
    res,
    {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      database: dbStates[mongoose.connection.readyState],
      timestamp: new Date().toISOString(),
    },
    'BoguraToLet API is running'
  );
});

// Future phases will be mounted here, for example:
// router.use('/auth', require('./authRoutes'));

module.exports = router;