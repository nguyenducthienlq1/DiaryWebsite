# Personal Diary Web Application — Project Scaffold

Cấu trúc khởi tạo dựa trên bộ tài liệu thiết kế (01-requirements → 06-wireframe).

## Cấu trúc
- `backend/` — Node.js + Express, layered architecture (routes → controllers → services → repositories)
- `frontend/` — React (Vite) + TypeScript + Tailwind CSS v4

## Cách chạy

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Sửa .env: DATABASE_URL trỏ tới PostgreSQL của bạn (local hoặc Railway)
# Sinh MASTER_ENCRYPTION_KEY: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npm run migrate   # chạy DDL tạo bảng (001_init_schema.sql)
npm run dev        # chạy dev server tại http://localhost:4000
```
Kiểm tra: mở `http://localhost:4000/api/v1/health` — nếu trả `{"success":true,"data":{"status":"ok","db":"connected"}}` là DB đã kết nối đúng.

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev   # chạy dev server tại http://localhost:5173
```

## Đã implement trong scaffold này
- Cấu trúc thư mục đầy đủ theo `03-architecture.md`
- Kết nối PostgreSQL (`db/pool.js`) + migration DDL từ `04-erd-schema.md`
- Crypto utility AES-256-GCM (`utils/crypto.js`)
- JWT middleware xác thực (`middlewares/authenticate.js`)
- Error handler chuẩn hóa response (`middlewares/errorHandler.js`)
- Health check endpoint (`GET /api/v1/health`)
- Frontend: routing (react-router), React Query provider, AuthContext, axios client với auto-refresh token
- Trang Login/EntryList dạng placeholder (chưa nối API thật)

## Chưa implement (bước tiếp theo)
- `auth.routes/controller/service` — login, refresh, logout thật (theo `05-api-design.md` mục 2)
- `entries.routes/controller/service/repository` — CRUD + filter/search (mục 3)
- `tags.routes` (mục 4)
- Các form/component UI thật thay cho placeholder (theo `06-wireframe.md`)
