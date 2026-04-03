# Development Workflow

## 1. Pick up a task

Trước khi sửa code:

- xác định task thuộc nhóm nào: connector, parser, audit, transform, planner, reporter hay CLI
- đọc [CODEBASE_INDEX.md](C:/Users/anhtr/Documents/WP/CODEBASE_INDEX.md) để khoanh vùng
- đọc [agent/CHANGE_PLAYBOOK.md](C:/Users/anhtr/Documents/WP/agent/CHANGE_PLAYBOOK.md) nếu task chạm contract

## 2. Read the relevant code first

Ví dụ:

- thêm source connector: đọc `shared-types`, `pipeline.ts`, `connectors/*`
- thêm detector: đọc `audit-source.ts`, `heuristics.ts`, test liên quan
- thêm transform rule: đọc `block-transformers.ts`, `structured-transform.ts`, report/manual-fix flow

## 3. Estimate impact area

Hỏi nhanh:

- có đổi `shared-types` không
- có đổi shape artifact không
- có đổi text/report output không
- có đổi recommendation/scoring không

Nếu có, scope review phải mở rộng sang docs và tests.

## 4. Implement in the smallest stable layer

- logic thuần đặt ở `migration-core`
- parsing/source loading ở `connectors` hoặc `parsers`
- CLI chỉ nên parse options và gọi core
- không đẩy business logic vào CLI

## 5. Update tests

Luôn cân nhắc:

- có cần fixture mới không
- có cần unit test mới không
- có làm test hiện tại đổi kỳ vọng không

Hiện repo dùng `vitest` với script:

```bash
pnpm test
pnpm typecheck
pnpm build
```

## 6. Update docs

Nếu task chạm:

- contract: update root docs + architecture docs + agent playbook
- artifact/report: update guides + audit docs
- scope/limitations: update README, AUDIT_SUMMARY, NEXT_STEPS

## 7. Self-review

- có overclaim không
- có mất raw payload không
- có thêm warning/fallback phù hợp chưa
- có giữ CLI behavior nhất quán không
- có mô tả đúng limitation không

## 8. Handoff

Một handoff tốt nên nói rõ:

- đã đổi file nào
- blast radius là gì
- test nào đã chạy
- còn assumption/gap nào
- bước tiếp theo hợp lý là gì
