# Data Flow

## 1. Input source

Nguồn đầu vào hiện có:

- `WXR` file qua [connectors/wxr.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/connectors/wxr.ts)
- `REST API` qua [connectors/rest.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/connectors/rest.ts)

## 2. Normalization

Mỗi connector trả về `WordPressSourceBundle`:

- site metadata
- authors
- taxonomy terms
- media
- content items
- custom post type findings

Điểm quan trọng:

- normalization gom dữ liệu từ các nguồn khác nhau về một contract chung
- bước này chưa làm enrich phức tạp hay dedupe sâu

## 3. Audit

`auditWordPressSource` đọc `WordPressSourceBundle` và tạo `AuditResult`.

Audit hiện thu thập:

- counts theo content type
- block inventory
- shortcode inventory
- risky HTML/embed/script issues
- builder/plugin hints
- difficulty score
- recommendation

## 4. Transform

`transformBundleItems` chạy trên `contentItems` và tạo `TransformResult[]`.

Transform hiện:

- parse Gutenberg blocks nếu có
- map block hỗ trợ sang `StructuredNode`
- preserve fallback/raw khi không hỗ trợ
- gắn warning item-level

## 5. Import planning

`createImportPlan` kết hợp:

- `WordPressSourceBundle`
- `TransformResult[]`

để tạo:

- entries cần tạo
- media cần import
- rewrite suggestions
- unresolved items
- manual fixes

## 6. Artifact generation

`writeArtifacts` ghi:

- `audit-result.json`
- `transform-preview.json` nếu có transform
- `import-plan.json` nếu có plan
- `migration-report.md`
- `manual-fixes.csv` nếu có plan
- `summary.json`

## 7. Import command behavior

Lệnh `import` hiện chưa push dữ liệu thật. Nó:

- chạy audit
- chạy transform
- tạo import plan
- gọi planning-only adapter để trả note

Đây là behavior hiện có, không phải live import.
