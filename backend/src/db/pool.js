const { Pool } = require('pg');

// Pool đọc cấu hình từ biến môi trường DATABASE_URL
// Vd: postgresql://user:password@host:5432/diary_db
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway/Managed Postgres thường yêu cầu SSL ở production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(1);
});

module.exports = pool;
