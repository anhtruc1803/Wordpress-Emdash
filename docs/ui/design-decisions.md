# Design Decisions

## 1. Chọn Next.js App Router thay vì dựng SPA rời

Lý do:

- cần route API trong cùng app để bridge sang `migration-core`
- cần server-side access tới filesystem cục bộ và workspace packages
- giúp UI và bridge sống cùng repo, dễ iterate trong MVP

Tradeoff:

- app bị gắn với môi trường Node có filesystem
- chưa tách được thành frontend thuần tĩnh

## 2. Chọn local bridge thay vì fake JSON fixtures trong UI

Lý do:

- yêu cầu sản phẩm là phải bám dữ liệu thật của core
- cần nhìn được artifact, audit, transform, import-plan thật
- tránh tạo showcase UI đẹp nhưng không vận hành được

Tradeoff:

- chưa có API contract ổn định cho tương lai
- dữ liệu hiện phụ thuộc layout `.console-data`

## 3. Chọn workspace theo dự án

Lý do:

- migration là workflow nhiều bước, không phải action đơn lẻ
- mỗi dự án cần giữ source config, snapshot, activity, manual-fix state

Tradeoff:

- cần thêm layer `ProjectRecord` và `WorkspaceView`
- phải derive project status từ nhiều nguồn dữ liệu

## 4. Chọn severity/status/recommendation system rõ ràng

Các hệ semantic đang dùng:

- severity: `Info`, `Low`, `Medium`, `High`
- project status: `Draft`, `Source Connected`, `Audited`, `Dry Run Complete`, `Ready for Import`, `Blocked`
- recommendation: `Ready`, `Cleanup Needed`, `Rebuild Recommended`

Lý do:

- giúp PM và content team đọc được risk mà không cần giải mã raw JSON
- tạo consistency giữa dashboard, audit, manual fixes, và import plan

## 5. Chọn light mode first

Lý do:

- console này nhiều bảng, badge, metadata, JSON preview
- light mode cho mật độ dữ liệu và khả năng in/screenshot tốt hơn trong demo nội bộ

Tradeoff:

- dark mode hiện chưa có

## 6. Chọn transform preview ba cột

Lý do:

- source, warnings, và structured output cần đặt cạnh nhau để debug
- chỉ xem JSON artifact riêng lẻ là quá chậm cho reviewer

Tradeoff:

- layout ưu tiên desktop
- mobile chỉ ở mức “không vỡ”, chưa tối ưu cho thao tác sâu

## 7. Chọn settings bảo thủ

Hiện chỉ project name editable.

Lý do:

- bridge backend chưa hỗ trợ parse/transform config đầy đủ
- không muốn dựng form giả cho những option chưa được core hiểu

Tradeoff:

- màn Settings còn mỏng
- tài liệu phải nói rõ đây là intentional gap

