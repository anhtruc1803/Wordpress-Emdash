# CLI Usage

## `audit`

Mục đích:

- đọc source
- tạo audit result
- ghi report và summary

Ví dụ:

```bash
wp2emdash audit ./site.xml --source wxr --output-dir ./artifacts/audit
wp2emdash audit https://example.com/wp-json --source api --output-dir ./artifacts/audit
```

Đầu ra:

- `audit-result.json`
- `migration-report.md`
- `summary.json`

## `dry-run`

Mục đích:

- chạy full pipeline trừ live import

Ví dụ:

```bash
wp2emdash dry-run ./site.xml --source wxr --output-dir ./artifacts/dry-run
```

Đầu ra:

- `audit-result.json`
- `transform-preview.json`
- `import-plan.json`
- `migration-report.md`
- `manual-fixes.csv`
- `summary.json`

## `import`

Mục đích hiện tại:

- tạo import plan gắn với target URL
- gọi planning-only adapter

Ví dụ:

```bash
wp2emdash import https://example.com/wp-json --source api --target http://localhost:4321 --output-dir ./artifacts/import-plan
```

Lưu ý:

- command này chưa import thật vào EmDash

## `report`

Mục đích:

- regenerate Markdown report từ `audit-result.json`

Ví dụ:

```bash
wp2emdash report ./artifacts/audit/audit-result.json --output ./artifacts/audit/report.md
```

## Exit behavior

- thành công: exit code `0`
- lỗi runtime/validation: exit code `1`
