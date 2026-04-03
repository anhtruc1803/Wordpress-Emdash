# Common Tasks

## Thêm một detector mới

1. Xác định detector thuộc audit hay transform.
2. Nếu là builder/plugin hint, sửa [heuristics.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/auditors/heuristics.ts).
3. Nếu detector tạo issue/count mới, sửa [audit-source.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/auditors/audit-source.ts).
4. Thêm test/fixture nếu cần.
5. Đồng bộ docs audit nếu output thay đổi.

## Thêm một CLI command mới

1. Thiết kế flow trong `migration-core` trước.
2. Export API qua [migration-core/index.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/index.ts).
3. Thêm command vào [migration-cli/index.ts](C:/Users/anhtr/Documents/WP/packages/migration-cli/src/index.ts).
4. Cập nhật guide CLI và onboarding.

## Thêm một artifact mới

1. Quyết định nó sinh từ audit, transform hay import plan.
2. Render content trong `reporters/` hoặc helper riêng.
3. Ghi file trong [write-artifacts.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/planners/write-artifacts.ts).
4. Cập nhật `GeneratedArtifacts` trong `shared-types`.
5. Update docs và tests.

## Thêm một transform rule

1. Sửa [block-transformers.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/transformers/block-transformers.ts).
2. Quyết định warning/fallback behavior khi rule thất bại.
3. Nếu cần, thêm block name vào `SUPPORTED_BLOCKS`.
4. Thêm test cho block đó.

## Thêm một fixture

1. Tạo fixture trong [packages/test-fixtures/fixtures](C:/Users/anhtr/Documents/WP/packages/test-fixtures/fixtures).
2. Dùng helper test hiện có để đọc fixture.
3. Giữ fixture nhỏ nhưng mang tín hiệu thực tế.
