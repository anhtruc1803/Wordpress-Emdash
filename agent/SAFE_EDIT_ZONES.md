# Safe Edit Zones

## Vùng tương đối an toàn

### `auditors/heuristics.ts`

An toàn khi:

- chỉ thêm matcher mới
- không đổi shape `BuilderOrPluginHint`

### `transformers/block-transformers.ts`

An toàn tương đối khi:

- thêm rule cho block mới
- giữ fallback behavior cho block chưa hỗ trợ
- không đổi shape `StructuredNode` hiện có

### `reporters/markdown-report.ts`

An toàn khi:

- chỉ thêm section mới dựa trên data đã tồn tại
- không đổi tên file artifact hoặc contract dữ liệu

### `reporters/manual-fixes-csv.ts`

An toàn khi:

- thêm cột mới có chủ đích và đã cập nhật docs/tests tương ứng

### `__tests__` và `test-fixtures`

An toàn khi:

- thêm fixture/test mới để mô tả behavior đã có hoặc behavior mới rõ ràng

## Ví dụ thay đổi an toàn

- thêm detector cho plugin mới
- thêm transform rule cho `core/pullquote`
- thêm field report từ data audit đã có
- thêm fixture cho shortcode edge case

## Điều kiện để vẫn an toàn

- không đổi shared contract
- không đổi CLI surface
- không làm biến mất raw payload/fallback
