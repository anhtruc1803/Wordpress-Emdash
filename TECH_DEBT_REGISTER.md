# Tech Debt Register

| ID | Area | Description | Impact | Priority | Proposed remediation |
| --- | --- | --- | --- | --- | --- |
| TD-001 | Import adapter | `import` vẫn là planning-only adapter, chưa có live target contract | User dễ hiểu nhầm mức hoàn thiện | High | Thiết kế interface target rõ hơn và thêm adapter thật khi contract ổn định |
| TD-002 | REST connector | Chưa có auth, retry, timeout policy riêng, rate-limit handling | Kém ổn định khi chạy với site thật | High | Thêm fetch wrapper có auth, timeout, retry và error taxonomy |
| TD-003 | Transform coverage | Chỉ hỗ trợ nhóm Gutenberg core block giới hạn | Manual cleanup còn cao | High | Thiết kế transformer registry và thêm block coverage dần |
| TD-004 | Heuristics | Builder/plugin detection dựa vào pattern cứng | False positive/negative | Medium | Tách registry detector và thêm evidence chi tiết hơn |
| TD-005 | Report compatibility | Artifact/report chưa có schema version | Khó duy trì tương thích khi format đổi | Medium | Thêm metadata version cho artifact chính |
| TD-006 | Tests | Chưa có CLI end-to-end test và live connector test doubles | Regression ở tầng command/output có thể lọt | Medium | Thêm tests cho CLI commands và artifact snapshots |
| TD-007 | Encoding hygiene | Tài liệu cũ từng có dấu hiệu mojibake | Giảm độ tin cậy tài liệu/report | Low | Giữ UTF-8 nhất quán và kiểm tra file text trong CI |
| TD-008 | Mapping flexibility | Collection mapping còn đơn giản theo pluralization | CPT thực tế có thể cần mapping riêng | Medium | Thêm config mapping layer theo project |
| TD-009 | Error model | Lỗi chủ yếu là `throw Error` chung chung | Khó phân loại và recover | Medium | Tạo error classes cho source, parse, transform, artifact |
| TD-010 | Artifact scale | Không có chiến lược chunking/streaming cho site lớn | Có thể tốn RAM và tạo file lớn | Medium | Đánh giá stream/partition cho nguồn và artifact lớn |
