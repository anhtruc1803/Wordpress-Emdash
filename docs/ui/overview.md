# UI Overview

## UI này là gì

`WordPress to EmDash Migration Console` là ứng dụng Next.js dùng lại core migration hiện có để tạo một migration workspace theo dự án. UI này phục vụ ba nhóm người dùng chính:

- developer cần inspect audit, transform, fallback, unresolved items
- PM hoặc tech lead cần xem độ khó, recommendation, và trạng thái dự án
- content/ops cần duyệt manual fixes và chuẩn bị handoff

## UI này không phải gì

- không phải one-click importer
- không phải visual theme recreation tool
- không phải backend multi-tenant
- không phải lớp mock dữ liệu độc lập với core

## Những gì đã được triển khai thật

- dashboard tổng hợp dự án và backlog manual fixes
- tạo project mới với `WXR` upload hoặc WordPress REST API URL
- workspace theo dự án với các màn hình overview, source, audit, dry-run, manual fixes, transform preview, import plan, artifacts, settings
- route API trong app dùng trực tiếp `migration-core`
- project store cục bộ dưới `.console-data/projects`
- demo seed project từ fixture `sample-wxr.xml` khi workspace trống

## Những gì còn tạm thời

- data bridge hiện là local JSON store, chưa phải service backend riêng
- import vẫn dừng ở planning-only adapter
- assignee và note của manual fixes chỉ là metadata local
- settings chưa mở rộng thành form đầy đủ cho parse/transform/output options

## Cấu trúc mức cao

- `app/app/*`: route UI
- `app/api/*`: server routes dùng làm bridge
- `components/*`: layout, data-display, table, domain-specific views
- `lib/api/*`: client fetch helpers
- `lib/hooks/*`: query hooks và local transform store
- `lib/server/*`: local project store, workspace assembly, storage helpers
- `lib/types/*`: UI view-models và API response types

## Mô hình vận hành

1. Tạo project.
2. Validate source hoặc chạy audit.
3. Review risk, block inventory, shortcode inventory, hints.
4. Chạy dry run để có transform preview, import plan, và manual fixes.
5. Review artifacts và handoff.

## Khi nào nên đọc file nào trước

- Người mới: bắt đầu từ [apps/migration-console/README.md](C:/Users/anhtr/Documents/WP/apps/migration-console/README.md) rồi sang [docs/ui/routes-and-screens.md](C:/Users/anhtr/Documents/WP/docs/ui/routes-and-screens.md)
- Developer: đọc [docs/ui/data-flow.md](C:/Users/anhtr/Documents/WP/docs/ui/data-flow.md) và [docs/ui/component-system.md](C:/Users/anhtr/Documents/WP/docs/ui/component-system.md)
- Agent: đọc tiếp `lib/server/project-store.ts`, `lib/server/workspace-view.ts`, và `lib/types/ui.ts`

