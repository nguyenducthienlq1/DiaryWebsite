const jwt = require('jsonwebtoken');

function createAccessToken(userId) {
    return jwt.sign(
        { userId, type: 'access' },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
    );
}

function createRefreshToken(userId) {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
}

function verifyRefreshToken(token) {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    if (payload.type !== 'refresh') {
        throw new Error('Không phải refresh token');
    }

    return payload;
}

module.exports = {
    createAccessToken,
    createRefreshToken,
    verifyRefreshToken,
};