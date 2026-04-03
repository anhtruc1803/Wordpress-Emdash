# Architecture Decisions

## 1. Chọn CLI-first thay vì UI-first

Quyết định:

- MVP được thiết kế quanh `wp2emdash` CLI.

Lý do:

- dễ chạy trong CI hoặc agent workflow
- output artifact dễ review
- ít giả định về môi trường hơn admin UI

Tradeoff:

- người dùng không kỹ thuật sẽ khó tiếp cận hơn
- chưa có remediation flow tương tác

## 2. Tách monorepo thành package nhỏ

Quyết định:

- `shared-types`, `migration-core`, `migration-cli`, `test-fixtures`

Lý do:

- khóa ranh giới giữa contract, logic và CLI
- dễ bàn giao cho agent/người mới
- giúp thấy rõ blast radius khi sửa type chung

Tradeoff:

- thay đổi contract cần đồng bộ nhiều package
- build/typecheck cần workspace discipline

## 3. Dùng structured intermediate representation

Quyết định:

- transform ra `StructuredNode[]` thay vì HTML normalized cuối cùng.

Lý do:

- phù hợp triết lý “structured content over serialized HTML”
- tạo điểm nối tự nhiên cho import planner và adapter tương lai
- giữ được semantics tốt hơn khi target API chưa rõ

Tradeoff:

- IR hiện còn tối giản
- chưa map 1:1 với model nội dung của EmDash

## 4. Safe fallback thay vì aggressive conversion

Quyết định:

- block không hỗ trợ sinh `fallback`
- shortcode giữ nguyên raw
- raw HTML được preserve thay vì ép convert

Lý do:

- giảm nguy cơ data loss âm thầm
- tăng khả năng manual recovery

Tradeoff:

- output cần cleanup thủ công nhiều hơn
- recommendation thường bảo thủ

## 5. Audit và transform là hai bước riêng

Quyết định:

- audit không phụ thuộc hoàn toàn vào transform output
- transform có warning riêng ở item level

Lý do:

- cho phép đánh giá rủi ro sớm
- tránh coupling quá chặt giữa report và transform engine

Tradeoff:

- một số tín hiệu bị tính ở hai nơi theo logic riêng
- cần đồng bộ docs khi thay scoring hoặc warning strategy

## 6. Import planning trước, live integration sau

Quyết định:

- `import` hiện dùng `PlanningOnlyEmDashTargetAdapter`

Lý do:

- target API EmDash chưa được khóa trong repo này
- import plan vẫn là output có giá trị thực tế

Tradeoff:

- tên lệnh `import` dễ bị hiểu quá khả năng hiện có nếu không đọc docs

## 7. Heuristic thay vì plugin-aware deep integration

Quyết định:

- builder/plugin hints dựa trên pattern matching

Lý do:

- nhanh để đạt MVP
- đủ tốt cho cảnh báo ban đầu

Tradeoff:

- có false positive/false negative
- chưa có registry cho plugin-specific detectors
