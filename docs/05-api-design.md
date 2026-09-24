# API Design Document
## Dự án: Personal Diary Web Application

**Phiên bản:** 1.0
**Tài liệu tham chiếu:** `03-architecture.md`, `04-erd-schema.md`

---

## 1. Quy ước chung

- **Base URL:** `/api/v1`
- **Format:** JSON cho request/response (trừ endpoint export trả `application/pdf`).
- **Auth:** Header `Authorization: Bearer <access_token>` cho mọi endpoint trừ `/auth/login` và `/auth/refresh`.
- **Response thành công:**
```json
{
  "success": true,
  "data": { }
}
```
- **Response lỗi (chuẩn hóa toàn hệ thống):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Tiêu đề không được để trống"
  }
}
```
- **Phân trang (dùng chung cho list endpoints):**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 57,
    "totalPages": 3
  }
}
```
- **Mã lỗi chuẩn hóa:** `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`.

---

## 2. Auth Endpoints

### POST `/auth/login`
Đăng nhập, trả về access token + set refresh token cookie.

| | |
|---|---|
| Auth required | Không |
| Rate limit | Nên giới hạn (vd 5 request/phút/IP) chống brute-force |

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "plaintext-password"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "user": { "id": "uuid", "email": "user@example.com", "displayName": "Mẹ" }
  }
}
```
> Response Header: `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict`

**Lỗi:** `401 UNAUTHORIZED` nếu email/password sai.

---

### POST `/auth/refresh`
Cấp lại access token từ refresh token cookie.

| | |
|---|---|
| Auth required | Cookie `refreshToken` |

**Response 200:**
```json
{ "success": true, "data": { "accessToken": "eyJhbGciOi..." } }
```

**Lỗi:** `401 UNAUTHORIZED` nếu refresh token hết hạn/không hợp lệ → frontend redirect về Login.

---

### POST `/auth/logout`
Hủy refresh token (xóa cookie, có thể thêm blacklist nếu cần).

**Response 200:**
```json
{ "success": true, "data": null }
```

## 3. Entries Endpoints

### POST `/entries`
Tạo bài viết mới (UC03).

**Request body:**
```json
{
  "title": "Một ngày bình yên",
  "content": "Nội dung nhật ký hôm nay...",
  "entryDate": "2026-09-05",
  "tags": ["tag-uuid-1", "tag-uuid-2"]
}
```

**Xử lý ở Service:** encrypt `content` → lưu `content_ciphertext/iv/auth_tag`; kiểm tra các tag ID đã tồn tại của user rồi liên kết `entry_tags`. Entry không tự tạo tag mới.

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Một ngày bình yên",
    "content": "Nội dung nhật ký hôm nay...",
    "entryDate": "2026-09-05",
    "tags": ["gia đình", "vui"],
    "createdAt": "2026-09-05T10:00:00Z"
  }
}
```
**Lỗi:** `VALIDATION_ERROR` nếu thiếu `title`/`content`/`entryDate` hoặc tag không tồn tại.

---

### GET `/entries`
Danh sách bài viết, hỗ trợ filter/search (UC04, UC08).

**Query params:**
| Param | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `from` | date | Không | Lọc từ ngày |
| `to` | date | Không | Lọc đến ngày |
| `tags` | string[] (csv hoặc lặp param) | Không | Lọc theo tag id, vd `?tags=id1,id2` |
| `search` | string | Không | Tìm theo title (fuzzy) |
| `page` | int | Không, default 1 | |
| `limit` | int | Không, default 20, max 100 | |

**Response 200:** (đã kèm meta phân trang như quy ước mục 1)
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "title": "Một ngày bình yên", "entryDate": "2026-09-05", "tags": ["gia đình"] }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```
> Lưu ý: endpoint list **không trả `content`** đầy đủ (tránh giải mã hàng loạt không cần thiết) — chỉ trả `title`, `entryDate`, `tags`. Client gọi `GET /entries/:id` khi cần xem chi tiết.

---

### GET `/entries/:id`
Xem chi tiết một bài viết (UC05).

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Một ngày bình yên",
    "content": "Nội dung đã giải mã...",
    "entryDate": "2026-09-05",
    "tags": ["gia đình", "vui"],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```
**Lỗi:** `NOT_FOUND` nếu không tồn tại hoặc không thuộc user hiện tại (không phân biệt 2 trường hợp này trong message, tránh lộ thông tin tồn tại của entry user khác).

---

### PUT `/entries/:id`
Sửa bài viết (UC06).

**Request body:** giống POST `/entries` (title, content, entryDate, tags — full update).

**Response 200:** entry đã cập nhật (cấu trúc như GET detail).

**Lỗi:** `NOT_FOUND` nếu không thuộc user hiện tại; `VALIDATION_ERROR` nếu dữ liệu không hợp lệ.

---

### DELETE `/entries/:id`
Soft delete (UC07).

**Response 200:**
```json
{ "success": true, "data": null }
```
**Lỗi:** `NOT_FOUND` nếu không thuộc user hiện tại hoặc đã bị xóa trước đó.

---

### GET `/entries/export`
Xuất PDF (UC10).

**Query params:**
| Param | Kiểu | Mô tả |
|---|---|---|
| `entryId` | uuid | Xuất 1 bài cụ thể (ưu tiên nếu có) |
| `from`, `to` | date | Xuất theo khoảng ngày (nếu không có `entryId`) |

**Response 200:** `Content-Type: application/pdf`, body là file stream.

**Lỗi:** `VALIDATION_ERROR` nếu không truyền `entryId` lẫn `from/to`.

---

## 4. Tags Endpoints

### GET `/tags`
Lấy toàn bộ tag của user hiện tại (phục vụ TagPicker component gợi ý khi viết bài).

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "gia đình" },
    { "id": "uuid", "name": "vui" }
  ]
}
```

### POST `/tags`
Tạo tag riêng trước khi gắn vào bài viết.

**Request body:**
```json
{ "name": "gia đình" }
```

**Response 201:**
```json
{
  "success": true,
  "data": { "id": "uuid", "name": "gia đình" }
}
```

> `POST /entries` và `PUT /entries/:id` chỉ nhận các tag ID đã có từ `POST /tags`. Nếu tag không tồn tại hoặc không thuộc user hiện tại, request bị từ chối.

---

## 5. Bảng tổng hợp Endpoint ↔ Use Case ↔ Query

| Endpoint | Use Case | Query tham chiếu (04-erd-schema.md) |
|---|---|---|
| POST /auth/login | UC01 | — |
| POST /auth/refresh | UC11 | — |
| POST /entries | UC03 | Mục 5.4 |
| GET /entries | UC04, UC08 | Mục 5.1, 5.2 |
| GET /entries/:id | UC05 | — |
| PUT /entries/:id | UC06 | — |
| DELETE /entries/:id | UC07 | Mục 5.3 |
| GET /entries/export | UC10 | Mục 5.1 (biến thể không phân trang) |
| GET /tags | UC09 | — |
| POST /tags | UC09 | — |

---

*Bước 5/6 trong quy trình: ~~Requirements~~ → ~~Use Case/User Flow~~ → ~~Architecture Diagram~~ → ~~ERD/Schema Design~~ → ~~API Design~~ → Wireframe.*
