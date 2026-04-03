# UI Data Flow

## Tóm tắt

UI không gọi trực tiếp CLI command và cũng không load JSON giả từ thư mục fixtures. Luồng dữ liệu hiện tại là:

```text
Browser UI
  -> TanStack Query hooks
    -> fetch client helpers
      -> Next API routes
        -> local project store / workspace builder
          -> migration-core
          -> .console-data project state
          -> per-run artifact directories
```

## Các lớp chính

### 1. Browser layer

Các page trong `app/app/*` dùng hooks từ `lib/hooks/queries.ts`.

Hook hiện có:

- `useDashboardQuery`
- `useProjectsQuery`
- `useWorkspaceQuery`
- `useCreateProjectMutation`
- `useRunAuditMutation`
- `useRunDryRunMutation`
- `useTestSourceMutation`
- `useUpdateManualFixMutation`
- `useUpdateProjectMutation`

### 2. Client API layer

`lib/api/client.ts` là lớp fetch duy nhất cho UI.

Nó map tới các route:

- `GET /api/dashboard`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id/workspace`
- `POST /api/projects/:id/actions/audit`
- `POST /api/projects/:id/actions/dry-run`
- `POST /api/projects/:id/actions/source-test`
- `PATCH /api/projects/:id/manual-fixes/:fixId`
- `PATCH /api/projects/:id`
- `GET /api/projects/:id/artifacts/:artifactKey`

### 3. Server bridge layer

`lib/server/project-store.ts` là orchestration file quan trọng nhất của UI layer.

Trách nhiệm:

- tạo project
- lưu source upload
- validate source qua `loadSourceBundle`
- chạy `executeAudit`
- chạy `executeDryRun`
- lưu snapshot workspace
- lưu activity log
- lưu local state cho manual fixes
- tạo demo project khi workspace rỗng

### 4. View-model assembly

`lib/server/workspace-view.ts` chuyển raw snapshot sang `WorkspaceView` dùng được cho UI:

- build `ManualFixRow[]`
- map severity theo heuristic
- derive `ProjectStatus`
- map recommendation strings sang badge labels
- ghép transform results với source items

### 5. Storage

`lib/server/storage.ts` định nghĩa layout local:

```text
.console-data/
  projects/
    <projectId>/
      project.json
      workspace.json
      activity.json
      manual-fixes-state.json
      source/
      runs/
```

## Artifact flow

- `migration-core` ghi artifact thật vào thư mục run
- `WorkspaceSnapshot.artifacts` giữ path tới các file mới nhất
- màn Artifacts gọi route text preview để hiển thị Markdown/CSV trực tiếp

## Tính tạm thời cần biết

- bridge hiện chỉ phù hợp local workspace
- chưa có concurrent editing strategy
- chưa có auth/session
- chưa có background job queue; audit và dry run là action request/response trực tiếp

