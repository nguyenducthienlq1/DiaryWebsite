const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/auth.controller");

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 15 phút
    max: 5, // giới hạn mỗi IP chỉ được phép thực hiện tối đa 5 lần đăng nhập trong khoảng thời gian windowMs
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Bạn đã thực hiện quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 1 phút.',
        },
    },
});

const registerLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Bạn đã đăng ký quá nhiều lần. Vui lòng thử lại sau 1 phút.',
        },
    },
});

router.post("/login", loginLimiter, authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);
router.post("/register", registerLimiter, authController.register);
router.post("/send-otp", authController.sendOtp);

module.exports = router;