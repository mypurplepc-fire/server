const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const dbStatus = await db.testConnection();

  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus.success ? 'connected' : 'disconnected',
      dbVersion: dbStatus.version || null,
    },
  });
});

module.exports = router;
