# Routes And Screens

## Route map

```text
/app
  /dashboard
  /projects
    /new
    /[projectId]
      /overview
      /source
      /audit
      /dry-run
      /manual-fixes
      /transform-preview
      /import-plan
      /artifacts
      /settings
```

## Screen inventory

| Route | Mục đích chính | Data chính | Trạng thái quan trọng |
| --- | --- | --- | --- |
| `/app/dashboard` | Tổng quan tất cả migration projects | `DashboardData` | empty dashboard, load error |
| `/app/projects` | Danh sách dự án và readiness | `ProjectRecord[]` | table filtering |
| `/app/projects/new` | Tạo project mới | `ProjectCreateInput` | validation cho WXR/API |
| `/app/projects/[projectId]/overview` | Tóm tắt dự án và hành động tiếp theo | `WorkspaceView` | no source, audit/dry-run pending |
| `/app/projects/[projectId]/source` | Xem và test source config | `ProjectRecord` | validation success/failure |
| `/app/projects/[projectId]/audit` | Xem kết quả audit | `AuditResult` + `riskBreakdown` | audit chưa chạy |
| `/app/projects/[projectId]/dry-run` | Tóm tắt dry-run và readiness | `TransformResult[]` + `ImportPlan` | dry-run chưa có |
| `/app/projects/[projectId]/manual-fixes` | Triage backlog thủ công | `ManualFixRow[]` | không có fixes |
| `/app/projects/[projectId]/transform-preview` | So sánh raw content, warnings, structured output | `MigrationItemDetail[]` | chưa có transform |
| `/app/projects/[projectId]/import-plan` | Xem entries/assets/unresolved items | `ImportPlan` | chưa có plan |
| `/app/projects/[projectId]/artifacts` | Preview và download artifacts | `GeneratedArtifacts` | chưa có artifacts |
| `/app/projects/[projectId]/settings` | Chỉnh metadata và đọc implementation flags | `ProjectRecord` | hiện chỉ edit tên project |

## Những màn hình quan trọng nhất

### Dashboard

- dành cho lead hoặc reviewer cần nhìn danh mục dự án
- ưu tiên số liệu tổng hợp hơn drill-down sâu
- có quick action tạo project và refresh

### Audit

- trả lời câu hỏi “migrate có khó không và vì sao”
- dựa trực tiếp trên `AuditResult`
- hiển thị content inventory, block inventory, shortcode inventory, builder/plugin hints

### Manual Fixes

- là màn hình operations-first
- có search và nhiều filter
- có khu drill-down chi tiết để lưu `status`, `notes`, `assignee`

### Transform Preview

- là màn hình developer-facing mạnh nhất
- dùng layout 3 cột: item list, raw source + warnings, structured output + fallback
- giúp review chính xác item-level behavior thay vì chỉ đọc JSON artifact

### Import Plan

- cho biết dry run hiện tại sẽ tạo gì và còn vướng gì
- chưa gọi target API thật
- dùng làm bề mặt review trước khi xây adapter EmDash thực

## Luồng điển hình theo vai trò

### Developer

1. Vào project overview.
2. Chạy audit hoặc dry run.
3. Mở transform preview.
4. Mở import plan.
5. Kiểm tra artifacts.

### PM hoặc Tech Lead

1. Vào dashboard.
2. Chọn project bị `Blocked` hoặc `Cleanup Needed`.
3. Mở audit và manual fixes để xác định mức effort.

### Content hoặc Ops

1. Vào manual fixes.
2. Lọc theo severity/status/content type.
3. Cập nhật notes hoặc assignee.
4. Dùng artifacts cho handoff.

