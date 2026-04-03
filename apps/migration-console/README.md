# WordPress to EmDash Migration Console

`WordPress to EmDash Migration Console` là lớp UI/UX cho monorepo `WordPress to EmDash Migration Assistant`. Ứng dụng này biến pipeline CLI và artifact-first hiện có thành một workspace thao tác được cho developer, PM, và content/ops.

## Mục tiêu của app

- hiển thị trạng thái migration theo dự án
- chạy audit và dry run qua một bridge server-side
- cho phép review manual fixes, transform preview, import plan, và artifacts
- giữ UI bám sát các contract thật của `migration-core` thay vì dựng mock JSON rời rạc

Console này không phải là admin panel hoàn chỉnh và cũng không phải một “nút bấm bọc CLI”. Nó là một workspace có project store cục bộ, route API riêng, và view-model riêng để phục vụ màn hình data-heavy.

## Tech stack

- Next.js App Router
- React 19 + TypeScript
- Tailwind CSS
- TanStack Query
- TanStack Table
- Zustand

## Chạy cục bộ

Từ root workspace:

```bash
pnpm install
pnpm --filter @wp2emdash/migration-console dev
```

Mở app tại `http://localhost:3000/app/dashboard`.

## Scripts chính

```bash
pnpm --filter @wp2emdash/migration-console dev
pnpm --filter @wp2emdash/migration-console typecheck
pnpm --filter @wp2emdash/migration-console test
pnpm --filter @wp2emdash/migration-console build
```

## Bridge hiện tại hoạt động thế nào

- UI gọi `/api/*` routes trong app Next.
- Các route này gọi `lib/server/project-store.ts`.
- `project-store` dùng `@wp2emdash/migration-core` để chạy `loadSourceBundle`, `executeAudit`, và `executeDryRun`.
- Dữ liệu workspace được lưu cục bộ dưới `.console-data/projects/<projectId>/`.
- Artifact thật vẫn do `migration-core` ghi ra theo từng run.

Điều này có nghĩa là app hiện tại phù hợp cho demo nội bộ, pairing, và review migration, nhưng chưa phải backend multi-user hay hosted product hoàn chỉnh.

## Route chính

- `/app/dashboard`
- `/app/projects`
- `/app/projects/new`
- `/app/projects/[projectId]/overview`
- `/app/projects/[projectId]/source`
- `/app/projects/[projectId]/audit`
- `/app/projects/[projectId]/dry-run`
- `/app/projects/[projectId]/manual-fixes`
- `/app/projects/[projectId]/transform-preview`
- `/app/projects/[projectId]/import-plan`
- `/app/projects/[projectId]/artifacts`
- `/app/projects/[projectId]/settings`

## Tài liệu UI

- [docs/ui/overview.md](C:/Users/anhtr/Documents/WP/docs/ui/overview.md)
- [docs/ui/routes-and-screens.md](C:/Users/anhtr/Documents/WP/docs/ui/routes-and-screens.md)
- [docs/ui/component-system.md](C:/Users/anhtr/Documents/WP/docs/ui/component-system.md)
- [docs/ui/data-flow.md](C:/Users/anhtr/Documents/WP/docs/ui/data-flow.md)
- [docs/ui/design-decisions.md](C:/Users/anhtr/Documents/WP/docs/ui/design-decisions.md)
- [docs/ui/future-enhancements.md](C:/Users/anhtr/Documents/WP/docs/ui/future-enhancements.md)

## Hạn chế hiện tại

- chưa có live EmDash import API
- chưa có authentication hoặc user system
- assignee/note cho manual fixes chỉ lưu cục bộ
- source settings hiện chỉ hỗ trợ edit tên dự án; parse/transform options chưa mở ra thành form cấu hình
- dashboard và tables chưa có pagination hoặc saved views

