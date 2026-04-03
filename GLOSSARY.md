# Glossary

- `WordPressSourceBundle`: mô hình normalized cho dữ liệu nguồn WordPress sau khi load/parsing.
- `StructuredNode`: intermediate representation cho nội dung đã transform.
- `AuditResult`: tổng hợp inventory, hints, issues, difficulty và recommendation.
- `TransformResult`: kết quả transform của từng content item, gồm content có cấu trúc và warnings.
- `ImportPlan`: kế hoạch nhập dữ liệu vào target, gồm entries, media, unresolved items và manual fixes.
- `GeneratedArtifacts`: đường dẫn các file đầu ra của pipeline.
- `WXR`: WordPress eXtended RSS export XML.
- `REST source`: nguồn WordPress lấy qua REST API `wp-json`.
- `Fallback block`: node giữ raw payload cho block không hỗ trợ.
- `Manual fix`: vấn đề cần người/agent xử lý sau pipeline tự động.
- `Builder/plugin hint`: tín hiệu heuristic cho page builder hoặc plugin có ảnh hưởng tới migration.
- `Planning-only adapter`: adapter chỉ xác nhận import plan, chưa thực hiện import thật.
