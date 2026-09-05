// Middleware xử lý lỗi tập trung — đặt cuối cùng trong app.js
// Chuẩn response lỗi tham chiếu: 05-api-design.md mục 1

function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.expose ? err.message : 'Đã có lỗi xảy ra, vui lòng thử lại sau';

  res.status(status).json({
    success: false,
    error: { code, message },
  });
}

module.exports = errorHandler;
