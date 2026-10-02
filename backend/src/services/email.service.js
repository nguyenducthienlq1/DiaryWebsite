const nodemailer = require('nodemailer');
const userRepository = require('../repositories/user.repository');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpMail = async (toEmail, otp) => {
  const user = await userRepository.findByEmail(toEmail);
  if (user) {
    const error = new Error('Email đã được đăng ký');
    error.status = 409;
    error.code = 'CONFLICT';
    error.expose = true;
    throw error;
  }
  const mailOptions = {
    from: `"Daily Diary" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Mã xác thực đăng ký tài khoản',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Xác thực tài khoản</h2>
        <p>Mã OTP của bạn là: <b style="font-size: 24px; color: #2563eb;">${otp}</b></p>
        <p>Mã này có hiệu lực trong vòng <b>5 phút</b>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendOtpMail };