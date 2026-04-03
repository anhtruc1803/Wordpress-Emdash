# Component System

## Mục tiêu của component layer

Component layer của console được chia theo mức trách nhiệm để tránh biến từng page thành một file khổng lồ:

- layout primitives
- reusable data-display primitives
- generic table wrapper
- domain components gắn với migration workflow

## Nhóm component

### Layout

- `AppShell`: khung sidebar + topbar cho toàn app
- `PageHeader`: tiêu đề trang, mô tả, trạng thái, action nhóm đầu trang
- `StickyActionBar`: hàng action sticky cho các màn workflow
- `Button`, `Input`, `Select`, `Textarea`: primitives nhẹ, không phụ thuộc domain

### Data display

- `StatCard`: chỉ số cấp cao
- `Panel`: khối hiển thị chuẩn
- `SectionHeader`: đầu mục cho panel
- `KeyValueList`: hiển thị metadata
- `StatusBadge`, `SeverityBadge`, `RecommendationBadge`: lớp semantic status thống nhất
- `LoadingState`, `ErrorState`, `EmptyState`: trạng thái màn hình chuẩn hóa

### Tables

- `DataTable<T>`: wrapper nhẹ quanh TanStack Table
- có search client-side
- có select-based filter definitions
- cố ý chưa có pagination/saved views để giữ MVP gọn

### Domain-specific

- `AuditSummaryPanel`
- `RiskBreakdownPanel`
- `ProjectStatusTimeline`
- `BlockInventoryTable`
- `ShortcodeInventoryTable`
- `ManualFixesTable`
- `TransformCompareView`
- `ImportPlanSummary`
- `ArtifactList`

## Quy tắc sử dụng

- page nên orchestration state, data loading, action wiring
- domain component nên render một khái niệm nghiệp vụ cụ thể
- generic component không nên import trực tiếp domain types ngoài khi thật sự cần
- nếu một màn cần interaction phức tạp theo item, ưu tiên tách thành domain component thay vì nhồi logic vào page

## Safe extension points

- thêm badge/state mới: `components/data-display/*`
- thêm filter hoặc column cho bảng: domain component tương ứng hoặc `DataTable`
- thêm panel audit/import summary: `components/domain/*`
- thêm client state tạm thời cho transform/manual-fix UX: `lib/hooks/*`

## Điểm cần chú ý

- `DataTable` hiện xử lý search/filter ở client-side; nếu dữ liệu lớn hơn nhiều cần đổi sang server-side filtering
- `TransformCompareView` dùng Zustand để giữ item đang chọn; nếu thêm deep-link bằng query string thì phải sync rất cẩn thận
- `ArtifactList` và các preview panel hiện đọc artifact text trực tiếp từ route bridge, chưa có markdown renderer chuyên biệt

