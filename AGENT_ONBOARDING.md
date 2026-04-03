# Agent Onboarding

## Mục tiêu file này

Giúp một AI coding agent mới nhận bàn giao repo mà không:

- overclaim feature
- sửa nhầm contract trung tâm
- bỏ sót test/docs cần đồng bộ

## Đọc theo thứ tự này

1. [README.md](C:/Users/anhtr/Documents/WP/README.md)
2. [PROJECT_OVERVIEW.md](C:/Users/anhtr/Documents/WP/PROJECT_OVERVIEW.md)
3. [CODEBASE_INDEX.md](C:/Users/anhtr/Documents/WP/CODEBASE_INDEX.md)
4. [packages/shared-types/src/index.ts](C:/Users/anhtr/Documents/WP/packages/shared-types/src/index.ts)
5. [packages/migration-core/src/pipeline.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/pipeline.ts)
6. [agent/SYSTEM_MAP.md](C:/Users/anhtr/Documents/WP/agent/SYSTEM_MAP.md)
7. [agent/SAFE_EDIT_ZONES.md](C:/Users/anhtr/Documents/WP/agent/SAFE_EDIT_ZONES.md)
8. [AUDIT_SUMMARY.md](C:/Users/anhtr/Documents/WP/AUDIT_SUMMARY.md)

## Cách đọc repo

- Bắt đầu từ contract trước, không bắt đầu từ CLI.
- Sau đó đọc orchestration pipeline.
- Chỉ khi hiểu flow `source -> audit -> transform -> plan -> artifact` mới vào module chi tiết.
- Trước khi sửa, tìm các test hiện có cho vùng đó.

## Guardrails khi sửa code

- Không mô tả `import` như live import nếu chưa thay adapter stub.
- Không thay đổi `shared-types` mà không rà soát parser, transform, planner, reporter và CLI.
- Không thêm feature chỉ ở docs mà không có code.
- Không chuyển warning thành conversion ngầm nếu chưa có fallback rõ ràng.

## Pre-patch checklist

- Tác vụ chạm package nào?
- Có đổi shape của artifact không?
- Có cần fixture mới không?
- Có test nào phải update?
- Có doc nào nói sai sau thay đổi này?

## Failure modes thường gặp

- thêm field vào `shared-types` nhưng quên reporter/CLI
- sửa parser làm đổi counts hoặc taxonomy mapping
- sửa scoring nhưng quên update audit docs
- thêm transform rule nhưng quên manual-fix behavior cho trường hợp lỗi
- thay report format nhưng quên compatibility note

## Khi nào nên dừng và báo rõ

- khi cần quyết định contract EmDash thật
- khi thay đổi có thể làm mất raw payload
- khi REST source cần auth/private endpoints
- khi feature yêu cầu page-builder specific logic sâu hơn heuristic hiện tại
