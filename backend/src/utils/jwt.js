const jwt = require('jsonwebtoken');

function createAccessToken(userId) {
    return jwt.sign(
        { userId, type: 'access' },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
    );
}

function createRefreshToken(userId) {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
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