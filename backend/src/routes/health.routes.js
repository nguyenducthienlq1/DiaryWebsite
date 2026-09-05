const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /api/v1/health — dùng để kiểm tra server và kết nối DB khi mới khởi tạo dự án
router.get('/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, data: { status: 'ok', db: 'connected' } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
