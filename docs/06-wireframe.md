# Wireframe Document (Low-Fidelity)
## Dự án: Personal Diary Web Application

**Phiên bản:** 1.0
**Tài liệu tham chiếu:** `02-usecase-userflow.md`, `05-api-design.md`

> Wireframe ở mức low-fidelity (ASCII layout), tập trung vào bố cục và thành phần UI, chưa đi vào màu sắc/typography — việc đó thuộc phạm vi UI Design, thực hiện sau khi wireframe được duyệt.

---

## 1. Màn hình Login

```
┌───────────────────────────────────────┐
│                                       │
│              [ Logo/App ]             │
│                                       │
│        Personal Diary                │
│                                       │
│   Email                              │
│   ┌───────────────────────────────┐   │
│   │                               │   │
│   └───────────────────────────────┘   │
│                                       │
│   Mật khẩu                            │
│   ┌───────────────────────────────┐   │
│   │                               │   │
│   └───────────────────────────────┘   │
│                                       │
│   [ ! Thông báo lỗi nếu sai ]         │
│                                       │
│   ┌───────────────────────────────┐   │
│   │          Đăng nhập            │   │
│   └───────────────────────────────┘   │
│                                       │
└───────────────────────────────────────┘
```
**Thành phần:** `InputField(email)`, `InputField(password, type=password)`, `ErrorBanner`, `ButtonPrimary(Đăng nhập)`.
**API liên quan:** `POST /auth/login`.

---

## 2. Màn hình Entry List (màn hình chính sau đăng nhập)

```
┌─────────────────────────────────────────────────────┐
│  Personal Diary                     [Avatar ▾ Đăng xuất] │
├─────────────────────────────────────────────────────┤
│  [ 🔍 Tìm theo tiêu đề...        ]                    │
│  [ Từ ngày ▾ ] [ Đến ngày ▾ ] [ Tag ▾ ]  [Xóa lọc]     │
│                                                       │
│                                    [ + Viết nhật ký ]  │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐    │
│  │ 05/09/2026                                   │    │
│  │ Một ngày bình yên                            │    │
│  │ #gia đình  #vui                              │    │
│  └─────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────┐    │
│  │ 04/09/2026                                   │    │
│  │ Hôm nay trời mưa                             │    │
│  │ #buồn                                        │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│              [ ◀ Trước ]  Trang 1/3  [ Sau ▶ ]        │
└─────────────────────────────────────────────────────┘
```
**Thành phần:** `Header`, `SearchInput`, `FilterBar (date range + tag select)`, `ButtonPrimary(Viết nhật ký)`, `EntryCard[]`, `Pagination`.
**API liên quan:** `GET /entries` (kèm query filter/search/page).
**Trạng thái đặc biệt:** Empty state khi không có kết quả — hiển thị hình minh họa + text "Chưa có bài viết nào phù hợp".

---

## 3. Màn hình Entry Detail

```
┌─────────────────────────────────────────────────────┐
│  ← Quay lại                                          │
├─────────────────────────────────────────────────────┤
│  Một ngày bình yên                                   │
│  05/09/2026                                          │
│  #gia đình  #vui                                     │
│                                                       │
│  ─────────────────────────────────────────────────  │
│                                                       │
│  Nội dung nhật ký đầy đủ hiển thị ở đây, có thể       │
│  dài nhiều đoạn văn bản...                           │
│                                                       │
│                                                       │
│  ─────────────────────────────────────────────────  │
│                                                       │
│  [ Sửa ]   [ In / Xuất PDF ]   [ Xóa ]                │
└─────────────────────────────────────────────────────┘
```
**Thành phần:** `BackButton`, `EntryHeader (title, date, tags)`, `ContentViewer`, `ButtonGroup(Sửa/In/Xóa)`.
**API liên quan:** `GET /entries/:id`; nút Xóa gọi `DELETE /entries/:id` kèm `ConfirmDialog`.

---

## 4. Màn hình Entry Form (dùng chung cho Create & Edit)

```
┌─────────────────────────────────────────────────────┐
│  ← Quay lại              [Tạo mới]/[Chỉnh sửa]        │
├─────────────────────────────────────────────────────┤
│  Tiêu đề                                             │
│  ┌───────────────────────────────────────────────┐  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│  Ngày viết        Tag                                │
│  ┌─────────────┐  ┌───────────────────────────────┐  │
│  │ 05/09/2026  │  │ [#gia đình x] [#vui x] [+ thêm]│  │
│  └─────────────┘  └───────────────────────────────┘  │
│                                                       │
│  Nội dung                                            │
│  ┌───────────────────────────────────────────────┐  │
│  │                                                 │  │
│  │                                                 │  │
│  │              (textarea lớn)                    │  │
│  │                                                 │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│                          [ Hủy ]   [ Lưu ]            │
└─────────────────────────────────────────────────────┘
```
**Thành phần:** `InputField(title)`, `DatePicker(entryDate)`, `TagPicker (chip input, autocomplete từ GET /tags)`, `TextArea(content)`, `ButtonSecondary(Hủy)`, `ButtonPrimary(Lưu)`.
**API liên quan:** `GET /tags` (gợi ý autocomplete), `POST /entries` (tạo mới) hoặc `PUT /entries/:id` (sửa).
**Validation client-side:** `title` và `content` không rỗng, `entryDate` không được là ngày trong tương lai (tùy chọn — cần xác nhận thêm nếu áp dụng).

---

## 5. Modal/Preview In (Print Preview)

```
┌─────────────────────────────────────────────────────┐
│                Xem trước bản in            [ X ]      │
├─────────────────────────────────────────────────────┤
│  ( ) Chỉ bài viết này                                 │
│  ( ) Theo khoảng ngày đang lọc: 01/09 - 05/09/2026    │
│                                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │        [ Xem trước nội dung dạng in ]          │  │
│  │                                                 │  │
│  └───────────────────────────────────────────────┘  │
│                                                       │
│                    [ Hủy ]   [ Tải PDF ]              │
└─────────────────────────────────────────────────────┘
```
**Thành phần:** `Modal`, `RadioGroup(phạm vi xuất)`, `PreviewFrame`, `ButtonPrimary(Tải PDF)`.
**API liên quan:** `GET /entries/export`.

---

## 6. Bảng ánh xạ Component ↔ Trang (tham chiếu `03-architecture.md` mục 3)

| Page | Components sử dụng |
|---|---|
| LoginPage | InputField, ErrorBanner, ButtonPrimary |
| EntryListPage | SearchInput, FilterBar, EntryCard, Pagination |
| EntryDetailPage | EntryHeader, ContentViewer, ButtonGroup, ConfirmDialog, PrintPreviewModal |
| EntryFormPage | InputField, DatePicker, TagPicker, TextArea |

---

## 7. Ghi chú responsive (Mobile-first)

Vì NFR5 yêu cầu tối ưu cho người dùng không chuyên và ưu tiên thiết bị di động:
- `FilterBar` trên mobile nên thu gọn thành 1 nút "Bộ lọc" mở `BottomSheet`, thay vì hiển thị ngang hàng như trên desktop.
- `EntryCard` trên mobile hiển thị full-width, stack dọc.
- `EntryFormPage`: `TextArea` nội dung nên chiếm phần lớn màn hình, bàn phím ảo không che mất nút "Lưu" (cần sticky button ở dưới).

---

*Bước 6/6 hoàn tất quy trình: ~~Requirements~~ → ~~Use Case/User Flow~~ → ~~Architecture Diagram~~ → ~~ERD/Schema Design~~ → ~~API Design~~ → ~~Wireframe~~.*

**Tổng kết:** Bộ 6 tài liệu (`01` → `06`) đã đủ để bắt đầu dựng project structure và code theo đúng kiến trúc đã thiết kế. Bước tiếp theo tự nhiên là khởi tạo repo (backend + frontend) theo cấu trúc thư mục ở `03-architecture.md` mục 7, và chạy DDL ở `04-erd-schema.md` để tạo database thật.
