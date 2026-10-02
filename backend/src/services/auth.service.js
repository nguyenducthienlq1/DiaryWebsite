const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');
const redis = require('../config/redis');
const {
    createAccessToken,
    createRefreshToken,
    verifyRefreshToken,
} = require('../utils/jwt');

function createAuthError(message) {
    const error = new Error(message);
    error.status = 401;
    error.code = 'UNAUTHORIZED';
    error.expose = true;
    return error;
}


async function login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        throw createAuthError('Email hoặc mật khẩu không đúng');
    }
    const passwordMatched = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatched) {
        throw createAuthError('Email hoặc mật khẩu không đúng');
    }
    return {
        accessToken: createAccessToken(user.id),
        refreshToken: createRefreshToken(user.id),
        user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
        },
    };
}
async function register(email, password, displayName, otp) {
    const normalizedDisplayName = displayName.trim();

    const cachedOtp = await redis.get(`otp:register:${email}`);
    if (!cachedOtp || cachedOtp !== otp) {
        const error = new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        error.expose = true;
        throw error;
    }
    if (cachedOtp !== otp) {
        const error = new Error('Mã OTP không hợp lệ');
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        error.expose = true;
        throw error;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        const error = new Error('Email không hợp lệ');
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        error.expose = true;
        throw error;
    }

    if (password.length < 8) {
        const error = new Error('Mật khẩu phải có ít nhất 8 ký tự');
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        error.expose = true;
        throw error;
    }

    if (normalizedDisplayName.length < 1 || normalizedDisplayName.length > 100) {
        const error = new Error('Tên hiển thị phải từ 1 đến 100 ký tự');
        error.status = 400;
        error.code = 'VALIDATION_ERROR';
        error.expose = true;
        throw error;
    }
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        const error = new Error('Email đã được sử dụng');
        error.status = 409;
        error.code = 'CONFLICT';
        error.expose = true;
        throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser;
    try {
        newUser = await userRepository.createUser(
            email,
            hashedPassword,
            normalizedDisplayName
        );
    } catch (error) {
        // Handle a concurrent request that passes the pre-check first.
        if (error.code === '23505') {
            const conflict = new Error('Email đã được sử dụng');
            conflict.status = 409;
            conflict.code = 'CONFLICT';
            conflict.expose = true;
            throw conflict;
        }
        throw error;
    }
    redis.del(`otp:register:${email}`);
    return {
        newUser: {
            id: newUser.id,
            email: newUser.email,
            displayName: newUser.displayName,
        }
    }
}

async function refreshToken(refreshToken) {
    if (!refreshToken) {
        throw createAuthError('Refresh token không được để trống');
    }
    let payload;
    try {
        payload = verifyRefreshToken(refreshToken);
    } catch (error) {
        throw createAuthError('Refresh token không hợp lệ');
    }
    return {
        accessToken: createAccessToken(payload.userId),
    }
}
module.exports = {
    login,
    register,
    refreshToken,
}; 