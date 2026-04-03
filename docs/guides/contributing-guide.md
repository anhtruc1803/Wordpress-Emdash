# Contributing Guide

## Quy tắc chung

- giữ contract rõ
- thêm logic vào layer phù hợp
- tránh đẩy nghiệp vụ vào CLI
- không mô tả unimplemented feature như đã hoàn thành

## Pattern code nên theo

- parser/source loading tách khỏi transform
- warning và fallback phải explicit
- helper thuần nên nằm ở `utils/` hoặc module logic nhỏ
- exports công khai nên đi qua `packages/migration-core/src/index.ts`

## Khi thêm tính năng mới

- cập nhật test
- cập nhật docs liên quan
- nếu đổi shape artifact, ghi rõ compatibility impact

## Pull request / handoff nên nói rõ

- scope thay đổi
- assumptions
- tests đã chạy
- docs nào đã đồng bộ
- debt hoặc gap mới phát sinh
