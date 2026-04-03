# System Overview

## Mục tiêu hệ thống

Hệ thống giúp biến một nguồn WordPress thành bộ artifact đủ tốt để:

- đánh giá độ khó migration
- xem trước transform có cấu trúc
- chuẩn bị import plan
- bàn giao cho engineer hoặc AI agent tiếp theo

## Thành phần chính

- `shared-types`: contract lớp miền dữ liệu
- `migration-core`: load, parse, audit, transform, plan, report
- `migration-cli`: bề mặt command line
- `test-fixtures`: dữ liệu mẫu phục vụ test

## Luồng điều phối

```text
CLI command
  -> pipeline.ts
    -> loadSourceBundle
      -> WXR connector OR REST connector
    -> auditWordPressSource
    -> transformBundleItems (dry-run/import)
    -> createImportPlan (dry-run/import)
    -> writeArtifacts
    -> optional planning-only adapter note (import)
```

## Tính chất kiến trúc

- CLI-first
- contract-first
- plan-first import
- preserve-over-perfect-conversion
- artifact-driven handoff

## Điều chưa có trong kiến trúc hiện tại

- worker queue
- database
- HTTP server
- plugin runtime cho custom transformers
- target adapter thật cho EmDash
