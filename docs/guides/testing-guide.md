# Testing Guide

## Bộ test hiện có

Repo hiện có các test trong [packages/migration-core/src/__tests__](C:/Users/anhtr/Documents/WP/packages/migration-core/src/__tests__):

- `wxr-parser.test.ts`
- `rest-normalization.test.ts`
- `gutenberg-transform.test.ts`
- `shortcode-detection.test.ts`
- `difficulty-scoring.test.ts`
- `report-generation.test.ts`

## Chạy test

```bash
pnpm test
```

Script mặc định dùng `vitest --pool=threads` để tránh lỗi process spawning trong môi trường Windows/sandbox đã gặp khi phát triển repo này.

## Khi nào cần thêm test

- thêm source connector mới
- thay đổi shape contract
- thêm transform rule mới
- đổi scoring/recommendation
- đổi report/manual-fix output

## Fixture strategy hiện tại

- `sample-wxr.xml`: WXR tối giản nhưng có Gutenberg, shortcode, HTML/script và CPT
- `sample-rest.json`: REST payload giả lập với post, page, custom type, taxonomy, media, users

## Gaps hiện tại

- chưa có CLI end-to-end tests
- chưa có live REST mock server tests
- chưa có snapshot tests cho artifact files
