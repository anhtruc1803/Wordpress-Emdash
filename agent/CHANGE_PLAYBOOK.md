# Change Playbook

## Nếu `shared-types` thay đổi

Phải kiểm tra:

- parser outputs
- transform outputs
- import plan generation
- artifact writer
- CLI types
- docs architecture/domain model

## Nếu parser thay đổi

Phải kiểm tra:

- WXR/REST tests
- audit counts
- transform input assumptions
- custom post type findings
- docs data-flow và audit docs

## Nếu scoring thay đổi

Phải kiểm tra:

- `difficulty-scoring.test.ts`
- report text
- `AUDIT_SUMMARY.md`
- docs audit risk/current-state nếu threshold/recommendation đổi đáng kể

## Nếu report format thay đổi

Phải kiểm tra:

- `markdown-report.ts` hoặc `manual-fixes-csv.ts`
- docs CLI/output examples
- compatibility note trong docs nếu downstream có thể bị ảnh hưởng

## Nếu thêm source connector mới

Pattern nên theo:

1. normalize về `WordPressSourceBundle`
2. không bỏ qua raw data quan trọng nếu chưa map được
3. thêm tests/fixtures riêng
4. chạm `pipeline.ts` chỉ ở mức hook connector vào flow
