# Debugging Guide

## Nếu lỗi nằm ở source loading

Đọc:

- [connectors/rest.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/connectors/rest.ts)
- [connectors/wxr.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/connectors/wxr.ts)
- [parsers/wxr.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/parsers/wxr.ts)

Kiểm tra:

- input path hoặc base URL
- response shape từ REST
- WXR có `rss.channel` hay không

## Nếu counts/report sai

Đọc:

- [auditors/audit-source.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/auditors/audit-source.ts)
- [auditors/difficulty.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/auditors/difficulty.ts)

Kiểm tra:

- block names parse ra là gì
- shortcode regex có match ngoài ý muốn không
- raw HTML bị tính ở đâu

## Nếu transform preview sai

Đọc:

- [transformers/structured-transform.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/transformers/structured-transform.ts)
- [transformers/block-transformers.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/transformers/block-transformers.ts)

Kiểm tra:

- block có thuộc `SUPPORTED_BLOCKS` không
- raw content có Gutenberg syntax thật không
- warning có bị duplicate hay không

## Nếu import plan sai

Đọc:

- [planners/create-import-plan.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/planners/create-import-plan.ts)
- [mappers/collection-mapper.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/mappers/collection-mapper.ts)

Kiểm tra:

- collection mapping mặc định
- unresolved rule
- manual fix derivation

## Nếu artifact không xuất như mong đợi

Đọc:

- [planners/write-artifacts.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/planners/write-artifacts.ts)
- [reporters/markdown-report.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/reporters/markdown-report.ts)
- [reporters/manual-fixes-csv.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/reporters/manual-fixes-csv.ts)

## Quy trình debug ngắn

1. tái hiện với fixture nhỏ
2. xác định bug ở load, audit, transform hay planning
3. thêm hoặc sửa test trước khi mở rộng logic
4. cập nhật docs nếu behavior có chủ đích thay đổi
