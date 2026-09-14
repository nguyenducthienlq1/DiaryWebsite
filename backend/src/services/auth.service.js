const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

function createAuthError(message){
    const error = new Error(message);
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    error.expose = true;
    return error;
}
async function login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        throw createAuthError('Email hoặc mật khẩu không đúng');
    }
    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
        throw createAuthError('Email hoặc mật khẩu không đúng');
    }
    return {
        accessToken: createAccessToken(user.id),
        refreshToken: createRefreshToken(user.id),
        user:{
            id: user.id,
            email: user.email,
            displayName: user.displayName,
        },
    };
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
    refreshToken,
}; 