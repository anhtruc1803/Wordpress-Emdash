# Extensibility Review

## Điều đang extensible tốt

- source connectors có boundary rõ
- audit heuristics dễ thêm rule mới
- block transform có chỗ để thêm rule mới
- reporters nhỏ và dễ mở rộng

## Điều sẽ cần refactor khi mở rộng

- `block-transformers.ts` nếu số block tăng nhanh
- `audit-source.ts` nếu detector phức tạp hơn
- `connectors/rest.ts` nếu thêm auth, retries, alternate endpoint discovery
- `create-import-plan.ts` khi target integration cụ thể hơn

## Pattern nên giữ

- normalize về contract chung trước
- thêm feature ở `migration-core`, không ở CLI
- preserve raw payload cho đường lui
- tách abstraction chỉ khi có pressure thật

## Kết luận

Kiến trúc hiện đủ tốt để mở rộng thêm 1-2 phase tiếp theo, miễn là team giữ discipline về contract và không dồn mọi logic mới vào pipeline hoặc switch lớn mà không tái cấu trúc.
