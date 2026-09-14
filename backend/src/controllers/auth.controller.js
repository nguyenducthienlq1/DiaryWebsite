const authService = require('../services/auth.service');

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, 
}

async function login(req, res, next){
    try {
        const { email, password } = req.body;
        if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email và mật khẩu là bắt buộc',
        },
      });
    }
    const result = await authService.login(email, password);

    res.cookie('refreshToken', result.refreshToken, cookieOptions);
    res.status(200).json({
        success: true,
        data: {
            accessToken: result.accessToken,
            user: result.user,
        },
    });
    } catch (error) {
        next(error);
    }
}

async function refreshToken(req, res, next){
    try {
        const {refreshToken} = req.cookies;
        const result = await authService.refreshToken(refreshToken);
        res.json({
            success: true,
            data: result,
        });
    } catch (error){
        next(error);
    }
}

function logout(req, res) {
  res.clearCookie('refreshToken', cookieOptions);

  res.json({
    success: true,
    data: null,
  });
}

module.exports = {
    login,
    refreshToken,
    logout,
};