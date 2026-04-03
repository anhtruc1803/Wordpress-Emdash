# WordPress to EmDash Migration Assistant

`WordPress to EmDash Migration Assistant` là một companion tool dạng CLI giúp audit, chuẩn hóa, transform và lên import plan cho nội dung WordPress trước khi đưa vào một workflow nội dung có cấu trúc theo tinh thần EmDash.

Mục tiêu của dự án không phải là “one-click converter”. Nó tập trung vào:

- audit nguồn WordPress từ `WXR` hoặc `REST API`
- parse nội dung Gutenberg khi có thể
- chuyển nội dung sang intermediate representation có cấu trúc
- phát hiện shortcode, raw HTML, embed, script và block không hỗ trợ
- tạo artifact để review và import planning

## Vì sao dự án này tồn tại

WordPress migration thường thất bại ở chỗ nội dung thật không chỉ là HTML thuần. Nó chứa block, shortcode, plugin artifacts, builder-specific markup và nhiều ràng buộc không portable. MVP này chọn cách:

- tự động hóa phần an toàn
- giữ semantic meaning hơn là cố tái tạo giao diện
- đẩy phần không chắc chắn vào warning, manual-fix list và import plan

## MVP hiện làm được gì

- đọc `WXR (.xml)` bằng parser riêng
- đọc WordPress REST API công khai bằng `fetch`
- normalize `posts`, `pages`, taxonomy cơ bản, authors, media, custom post types cơ bản
- parse Gutenberg bằng `@wordpress/block-serialization-default-parser`
- transform một nhóm block cốt lõi sang `StructuredNode`
- tạo `AuditResult`, `TransformResult`, `ImportPlan`
- sinh artifact:
  - `audit-result.json`
  - `transform-preview.json`
  - `import-plan.json`
  - `migration-report.md`
  - `manual-fixes.csv`
  - `summary.json`
- cung cấp CLI `wp2emdash` với các lệnh `audit`, `dry-run`, `import`, `report`

## MVP hiện chưa làm

- chưa import thật vào EmDash
- chưa có auth flow cho private WordPress REST API
- chưa hỗ trợ page builder conversion hoàn chỉnh
- chưa resolve shortcode sang output tương đương
- chưa có UI quản trị
- chưa có compatibility layer cho target API EmDash cụ thể

Lệnh `import` hiện chỉ tạo plan và gọi adapter stub.

## Quick Start

```bash
pnpm install
pnpm build
pnpm test
```

Audit fixture WXR:

```bash
node packages/migration-cli/dist/index.js audit packages/test-fixtures/fixtures/sample-wxr.xml --source wxr --output-dir artifacts/sample-audit
```

Dry run fixture WXR:

```bash
node packages/migration-cli/dist/index.js dry-run packages/test-fixtures/fixtures/sample-wxr.xml --source wxr --output-dir artifacts/sample-dry-run
```

## CLI chính

```bash
wp2emdash audit <input> --source wxr|api --output-dir ./artifacts
wp2emdash dry-run <input> --source wxr|api --output-dir ./artifacts
wp2emdash import <input> --source wxr|api --target http://localhost:4321 --output-dir ./artifacts
wp2emdash report <path-to-audit-result.json> --output ./migration-report.md
```

## Ví dụ artifact đầu ra

`summary.json`

```json
{
  "totalItems": 3,
  "transformedItems": 3,
  "unresolvedItems": 2,
  "recommendation": "import with manual cleanup"
}
```

`manual-fixes.csv`

```csv
sourceId,sourceType,reason,detail
"101","post","shortcode","[gallery ids=""5,6""]"
```

## Cấu trúc repo

- [packages/shared-types/src/index.ts](C:/Users/anhtr/Documents/WP/packages/shared-types/src/index.ts): contract trung tâm
- [packages/migration-core/src/pipeline.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/pipeline.ts): orchestration chính
- [packages/migration-cli/src/index.ts](C:/Users/anhtr/Documents/WP/packages/migration-cli/src/index.ts): CLI entry point
- [packages/test-fixtures/fixtures/sample-wxr.xml](C:/Users/anhtr/Documents/WP/packages/test-fixtures/fixtures/sample-wxr.xml): fixture WXR

## Đọc tiếp ở đâu

- [PROJECT_OVERVIEW.md](C:/Users/anhtr/Documents/WP/PROJECT_OVERVIEW.md): bối cảnh sản phẩm và workflow
- [CODEBASE_INDEX.md](C:/Users/anhtr/Documents/WP/CODEBASE_INDEX.md): sơ đồ repo và thứ tự đọc
- [AGENT_ONBOARDING.md](C:/Users/anhtr/Documents/WP/AGENT_ONBOARDING.md): cách một AI agent nên nhận bàn giao
- [AUDIT_SUMMARY.md](C:/Users/anhtr/Documents/WP/AUDIT_SUMMARY.md): trạng thái hiện tại và rủi ro chính
- [docs/architecture/system-overview.md](C:/Users/anhtr/Documents/WP/docs/architecture/system-overview.md): kiến trúc tổng thể
- [docs/guides/cli-usage.md](C:/Users/anhtr/Documents/WP/docs/guides/cli-usage.md): cách dùng CLI thực tế
