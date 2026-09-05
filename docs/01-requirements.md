# Software Requirements Specification (SRS)
## Dự án: Personal Diary Web Application

**Phiên bản:** 1.0
---

## 1. Giới thiệu

### 1.1 Mục đích tài liệu
Tài liệu này mô tả yêu cầu chức năng và phi chức năng của hệ thống **Personal Diary Web Application** — một ứng dụng web cho phép người dùng viết, lưu trữ, tìm kiếm và in nhật ký cá nhân một cách riêng tư và an toàn.

### 1.2 Phạm vi dự án
Hệ thống cung cấp cho người dùng cuối (End User) khả năng:
- Đăng nhập an toàn vào tài khoản cá nhân.
- Tạo, xem, sửa, xóa các bài nhật ký.
- Gắn tag và tìm kiếm/lọc bài viết theo ngày, tag.
- Xuất/in bài viết dưới định dạng dễ đọc.
- Đảm bảo nội dung nhật ký được bảo mật ở mức cao (mã hóa dữ liệu).

### 1.3 Đối tượng sử dụng tài liệu
Tài liệu phục vụ cho đội ngũ phát triển (backend, frontend), và làm cơ sở tham chiếu khi thiết kế kiến trúc hệ thống, database, và API ở các giai đoạn tiếp theo.

---

## 2. Tổng quan hệ thống

### 2.1 Bối cảnh
Sản phẩm là ứng dụng single-purpose, quy mô nhỏ, phục vụ số lượng người dùng hạn chế (cá nhân/hộ gia đình), ưu tiên tính đơn giản, bảo mật nội dung và chi phí vận hành thấp.

### 2.2 Actors

| Actor | Mô tả |
|---|---|
| End User | Người dùng cuối — sở hữu và thao tác trên nhật ký của chính mình |
| System Administrator | Vận hành hệ thống, không có quyền truy cập nội dung nhật ký đã mã hóa của người dùng |

### 2.3 Giả định về quy mô
Hệ thống được thiết kế cho một số lượng nhỏ người dùng (single-tenant hoặc vài tài khoản độc lập), nhưng kiến trúc và schema **phải hỗ trợ mô hình multi-user** ngay từ đầu để đảm bảo khả năng mở rộng trong tương lai.

---

## 3. Yêu cầu chức năng (Functional Requirements)

### FR1 — Authentication & Authorization
- FR1.1: Hệ thống cho phép người dùng đăng nhập bằng username/email + password.
- FR1.2: Hệ thống cấp JWT access token sau khi xác thực thành công.
- FR1.3: Access token có thời hạn ngắn (15–30 phút); refresh token lưu tại HTTP-only cookie, dùng để cấp lại access token.
- FR1.4: Mật khẩu phải được hash (bcrypt/argon2) trước khi lưu trữ; không lưu plaintext dưới bất kỳ hình thức nào.
- FR1.5: Mỗi người dùng chỉ có quyền truy cập dữ liệu của chính mình (data isolation theo `user_id`).

### FR2 — Quản lý bài viết (Diary Entry CRUD)
- FR2.1: Tạo bài viết mới gồm tiêu đề, nội dung, ngày viết, tag (tùy chọn).
- FR2.2: Xem danh sách bài viết của người dùng hiện tại, phân trang, sắp xếp theo ngày (mới nhất trước).
- FR2.3: Xem chi tiết một bài viết.
- FR2.4: Chỉnh sửa nội dung bài viết đã tạo.
- FR2.5: Xóa bài viết theo cơ chế soft delete (đánh dấu `deleted_at`, hỗ trợ khôi phục).

### FR3 — Quản lý Tag
- FR3.1: Người dùng có thể gắn một hoặc nhiều tag cho mỗi bài viết.
- FR3.2: Người dùng có thể tạo tag mới tự do trong quá trình viết bài.

### FR4 — Tìm kiếm & Lọc
- FR4.1: Lọc danh sách bài viết theo khoảng thời gian (từ ngày – đến ngày).
- FR4.2: Lọc theo một hoặc nhiều tag.
- FR4.3: Tìm kiếm theo tiêu đề (full-text trên trường không mã hóa); tìm kiếm nội dung được xử lý ở tầng service sau khi giải mã.

### FR5 — Xuất bản in (Print/Export)
- FR5.1: Cho phép chọn một bài viết hoặc một khoảng thời gian để xuất ra định dạng in được (print-friendly view hoặc PDF).
- FR5.2: Bản xuất hiển thị nội dung đã giải mã, trình bày rõ ràng theo ngày, tiêu đề, nội dung, tag.

### FR6 — Bảo mật dữ liệu
- FR6.1: Trường nội dung (`content`) của bài viết được mã hóa ở tầng ứng dụng (application-level encryption) trước khi lưu vào cơ sở dữ liệu.
- FR6.2: Nội dung chỉ được giải mã tại backend, sau khi xác thực JWT hợp lệ, và chỉ trả về cho đúng chủ sở hữu.
- FR6.3: Dữ liệu ở tầng lưu trữ không được truy cập ở dạng plaintext nếu không có khóa giải mã hợp lệ.

---

## 4. Yêu cầu phi chức năng (Non-Functional Requirements)

| # | Yêu cầu | Mô tả chi tiết |
|---|---|---|
| NFR1 | Hiệu năng | Thời gian phản hồi API cho các thao tác CRUD cơ bản < 300ms trong điều kiện tải thấp |
| NFR2 | Bảo mật | HTTPS bắt buộc ở môi trường production; JWT ký bằng secret đủ mạnh; mã hóa nội dung bằng AES-256-GCM; hash mật khẩu bằng bcrypt/argon2 |
| NFR3 | Khả năng bảo trì | Kiến trúc phân lớp rõ ràng (routes → controller → service → data access layer), tuân thủ coding convention nhất quán |
| NFR4 | Khả năng mở rộng | Schema cơ sở dữ liệu hỗ trợ mô hình multi-user, dễ dàng bổ sung tính năng ở các phiên bản sau |
| NFR5 | Khả năng sử dụng | Giao diện đơn giản, tối ưu cho người dùng không chuyên về công nghệ; responsive tốt trên thiết bị di động |
| NFR6 | Sao lưu & phục hồi dữ liệu | Cần có cơ chế backup định kỳ cho cơ sở dữ liệu, đảm bảo khả năng khôi phục khi có sự cố |

---

## 5. Ràng buộc & Giả định (Constraints & Assumptions)

- Ưu tiên sử dụng các dịch vụ hạ tầng thuộc free-tier (Vercel, Railway) để tối ưu chi phí vận hành.
- Hệ thống chỉ hỗ trợ ngôn ngữ tiếng Việt ở phiên bản đầu tiên (không yêu cầu i18n).
- Không yêu cầu ứng dụng di động native; giao diện web cần responsive tốt trên trình duyệt di động.
- Phiên bản đầu tiên không hỗ trợ chia sẻ bài viết công khai hoặc giữa nhiều người dùng.

---

## 6. Vấn đề kỹ thuật cần thống nhất trước khi thiết kế ERD/API

1. **Tìm kiếm trên nội dung đã mã hóa:** vì trường `content` được mã hóa, không thể thực hiện `LIKE` trực tiếp trong SQL. Hai phương án:
   - (a) Full-text search trên trường `title` (không mã hóa), kết hợp lọc theo ngày/tag — phù hợp cho phiên bản đầu.
   - (b) Giải mã toàn bộ entries của người dùng ở tầng service rồi tìm kiếm trong bộ nhớ — khả thi vì số lượng bản ghi trên mỗi người dùng không lớn.
   → Đề xuất: áp dụng (a) làm cơ chế search chính, (b) là phương án mở rộng khi cần tìm kiếm sâu theo nội dung.
2. **Quản lý encryption key:** lưu trữ tại biến môi trường (không commit vào version control); mỗi bản ghi có thể lưu kèm salt/IV riêng.
3. **Cơ chế xuất bản in:** cân nhắc sử dụng thư viện tạo PDF phía backend (`pdfkit` hoặc `puppeteer`) thay vì chỉ dựa vào CSS `@media print`, để đảm bảo định dạng nhất quán, đặc biệt với văn bản tiếng Việt có dấu.

---

## 7. Ngoài phạm vi phiên bản 1 (Out of Scope)

- Mô hình multi-user đầy đủ (đăng ký công khai, mời thành viên).
- Chia sẻ bài viết hoặc chức năng bình luận.
- Ứng dụng di động native.
- Đính kèm hình ảnh (có thể xem xét bổ sung ở phiên bản sau).

---

*Tài liệu này là bước 1/6 trong quy trình phát triển: Requirements → Use Case/User Flow → Architecture Diagram → ERD/Schema Design → API Design → Wireframe.*