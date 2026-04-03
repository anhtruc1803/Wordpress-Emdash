# Test Coverage Review

## Đã được test

- WXR parsing
- REST normalization
- Gutenberg transform
- shortcode detection
- difficulty scoring
- report generation

## Chưa được test

- CLI command parsing/end-to-end
- artifact writing ra filesystem
- planning-only adapter behavior
- REST fetch pagination với dữ liệu thật hoặc mocked HTTP
- edge cases của unsupported block payloads
- rewrite suggestion logic

## Missing tests quan trọng nhất

1. CLI smoke tests cho `audit`, `dry-run`, `report`
2. test artifact file contents cho `writeArtifacts`
3. tests cho CPT collection mapping
4. tests cho fallback behavior của unsupported blocks
5. tests cho raw HTML legacy content path

## Fixture gaps

- chưa có fixture WXR lớn hơn với taxonomy tree sâu
- chưa có fixture chứa nhiều shortcode/plugin combinations
- chưa có REST fixture cho pagination nhiều trang
- chưa có fixture cho malformed-but-recoverable input
