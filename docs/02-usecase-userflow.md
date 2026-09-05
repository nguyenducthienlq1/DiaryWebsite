# Use Case & User Flow Specification
## Dự án: Personal Diary Web Application

**Phiên bản:** 1.0


---

## 1. Danh sách Use Case

| ID | Use Case | Actor | Mô tả ngắn |
|---|---|---|---|
| UC01 | Login | End User | Đăng nhập vào hệ thống bằng username/email + password |
| UC02 | Logout | End User | Đăng xuất, hủy phiên làm việc |
| UC03 | Create Diary Entry | End User | Tạo bài viết mới, có thể gắn tag |
| UC04 | View Entry List | End User | Xem danh sách bài viết, phân trang |
| UC05 | View Entry Detail | End User | Xem chi tiết một bài viết |
| UC06 | Edit Entry | End User | Chỉnh sửa bài viết đã tạo |
| UC07 | Delete Entry | End User | Xóa (soft delete) một bài viết |
| UC08 | Filter/Search Entries | End User | Lọc theo ngày, tag, hoặc tìm theo tiêu đề |
| UC09 | Manage Tags | End User | Tạo tag mới, gắn/gỡ tag khỏi bài viết |
| UC10 | Export/Print Entry | End User | Xuất một bài hoặc khoảng thời gian ra bản in/PDF |
| UC11 | Refresh Token | System | Tự động cấp lại access token khi hết hạn (không cần thao tác thủ công của user) |

---

## 2. Use Case Diagram

```mermaid
flowchart LR
    User((End User))

    subgraph System["Personal Diary Web Application"]
        UC01([Login])
        UC02([Logout])
        UC03([Create Entry])
        UC04([View Entry List])
        UC05([View Entry Detail])
        UC06([Edit Entry])
        UC07([Delete Entry])
        UC08([Filter / Search])
        UC09([Manage Tags])
        UC10([Export / Print])
    end

    User --> UC01
    User --> UC02
    User --> UC03
    User --> UC04
    User --> UC05
    User --> UC06
    User --> UC07
    User --> UC08
    User --> UC09
    User --> UC10

    UC03 -.include.-> UC09
    UC04 -.include.-> UC08
    UC06 -.extend.-> UC05
    UC07 -.extend.-> UC05
```

**Ghi chú quan hệ:**
- `UC03 include UC09`: tạo bài viết luôn đi kèm khả năng gắn tag.
- `UC04 include UC08`: màn hình danh sách tích hợp sẵn thanh filter/search.
- `UC06/UC07 extend UC05`: sửa/xóa được thực hiện từ màn hình chi tiết bài viết.

---

## 3. User Flow chi tiết theo kịch bản chính

### 3.1 Flow: Đăng nhập

```mermaid
flowchart TD
    A[Mở trang web] --> B{Đã có session hợp lệ?}
    B -- Có --> C[Vào thẳng Entry List]
    B -- Không --> D[Hiển thị form Login]
    D --> E[Nhập email/username + password]
    E --> F{Xác thực hợp lệ?}
    F -- Sai --> G[Hiển thị lỗi, giữ nguyên form]
    G --> E
    F -- Đúng --> H[Server trả về Access Token + Refresh Token cookie]
    H --> C
```

### 3.2 Flow: Tạo bài viết mới

```mermaid
flowchart TD
    A[Entry List] --> B[Nhấn nút Tạo bài mới]
    B --> C[Form nhập: tiêu đề, nội dung, ngày, tag]
    C --> D{Validate dữ liệu client-side}
    D -- Thiếu/lỗi --> E[Hiển thị cảnh báo tại field]
    E --> C
    D -- Hợp lệ --> F[Gửi request POST /entries]
    F --> G[Backend mã hóa content, lưu DB]
    G --> H[Trả về entry vừa tạo]
    H --> I[Redirect về Entry List, hiển thị bài mới]
```

### 3.3 Flow: Tìm kiếm / Lọc bài viết

```mermaid
flowchart TD
    A[Entry List] --> B[Người dùng chọn bộ lọc: khoảng ngày / tag / từ khóa tiêu đề]
    B --> C[Gửi request GET /entries kèm query params]
    C --> D{Có kết quả?}
    D -- Có --> E[Hiển thị danh sách đã lọc]
    D -- Không --> F[Hiển thị trạng thái Empty]
    E --> G[Người dùng có thể xóa filter để quay lại danh sách đầy đủ]
    F --> G
```

### 3.4 Flow: Xuất bản in

```mermaid
flowchart TD
    A[Entry Detail hoặc Entry List đã lọc theo khoảng ngày] --> B[Nhấn nút Export/Print]
    B --> C[Chọn phạm vi: 1 bài / theo khoảng ngày đang lọc]
    C --> D[Gửi request GET /entries/export]
    D --> E[Backend giải mã nội dung, render HTML/PDF]
    E --> F[Trả file PDF hoặc mở print-preview]
```

### 3.5 Flow: Sửa / Xóa bài viết

```mermaid
flowchart TD
    A[Entry Detail] --> B{Hành động}
    B -- Sửa --> C[Mở form edit, prefill dữ liệu hiện tại]
    C --> D[Submit PUT /entries/:id]
    D --> E[Backend mã hóa lại content mới, update DB]
    E --> F[Quay lại Entry Detail, hiển thị bản cập nhật]
    B -- Xóa --> G[Hiển thị confirm dialog]
    G -- Xác nhận --> H[Gửi DELETE /entries/:id]
    H --> I[Backend set deleted_at, không xóa cứng]
    I --> J[Quay về Entry List]
    G -- Hủy --> A
```

---

## 4. Ghi chú cho giai đoạn tiếp theo

Các use case và flow trên là cơ sở trực tiếp để:
- Thiết kế **API endpoints** (mỗi flow tương ứng 1–2 endpoint).
- Thiết kế **ERD**: các thực thể `User`, `DiaryEntry`, `Tag`, `EntryTag` (bảng trung gian) đã lộ rõ qua UC03/UC09.
- Thiết kế **Architecture Diagram**: điểm cần lưu ý là bước mã hóa/giải mã content nằm ở tầng Service, không lộ ra Controller hay client.

---

*Bước 2/6 trong quy trình: ~~Requirements~~ → ~~Use Case/User Flow~~ → Architecture Diagram → ERD/Schema Design → API Design → Wireframe.*
