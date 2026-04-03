# Project Overview

## Business problem

Nhiều dự án WordPress muốn chuyển sang workflow nội dung có cấu trúc hơn, nhưng nội dung hiện tại thường bị trộn giữa:

- Gutenberg blocks
- shortcode
- HTML tùy biến
- plugin/page-builder markup
- custom post types

Nếu chỉ “copy HTML sang hệ mới”, nhóm triển khai dễ mất semantic meaning và khó tạo một import pipeline bền vững.

## Technical problem

Cần một công cụ trung gian có thể:

1. đọc nguồn WordPress
2. normalize dữ liệu thành model nhất quán
3. audit rủi ro migration
4. transform phần an toàn sang structured representation
5. giữ fallback cho phần không chắc chắn
6. tạo import plan thay vì giả định target integration đã rõ

## Product scope hiện tại

MVP hiện hỗ trợ:

- input từ `WXR` và `REST API`
- audit block inventory, shortcode, risky HTML, builder/plugin hints
- transform Gutenberg-oriented content
- import planning artifact generation
- CLI-first workflow

MVP không hỗ trợ:

- theme cloning
- visual fidelity conversion
- plugin migration hoàn chỉnh
- live EmDash import

## User workflow

1. Chạy `audit` để biết mức độ khó và rủi ro.
2. Chạy `dry-run` để xem transform preview và import plan.
3. Review `migration-report.md` và `manual-fixes.csv`.
4. Chạy `import` khi muốn tạo plan gắn với một target URL.
5. Dùng import plan làm đầu vào cho adapter hoặc bước tích hợp sau này.

## Nguyên tắc cốt lõi

Đây là một migration assistant, không phải one-click converter.

Nguyên tắc thực thi:

- tự động hóa phần an toàn
- cảnh báo sớm phần không portable
- giữ raw payload cho recovery
- ưu tiên report, warnings và handoff clarity

## Trạng thái hiện tại

- pipeline cốt lõi đã hoạt động
- tests đang bao phủ parser, normalization, transform, scoring, report generation
- live target integration vẫn là khoảng trống có chủ đích
