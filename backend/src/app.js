require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true, // cần thiết để gửi/nhận cookie refresh token
}));
app.use(express.json());
app.use(cookieParser());

// Routes — mount thêm auth.routes, entries.routes, tags.routes khi triển khai tiếp
app.use('/api/v1', healthRoutes);

//Auth routes
app.use('/api/v1/auth', authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Endpoint không tồn tại' },
  });
});

// Error handler — luôn đặt cuối cùng
app.use(errorHandler);

module.exports = app;
