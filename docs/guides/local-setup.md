# Local Setup

## Yêu cầu

- Node.js 24.x đã được dùng trong workspace hiện tại
- `pnpm` 10.x

## Cài đặt

```bash
pnpm install
pnpm build
pnpm test
```

## Các package trong workspace

- `packages/shared-types`
- `packages/migration-core`
- `packages/migration-cli`
- `packages/test-fixtures`

## Kiểm tra nhanh repo

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Chạy thử trên fixture

```bash
node packages/migration-cli/dist/index.js audit packages/test-fixtures/fixtures/sample-wxr.xml --source wxr --output-dir artifacts/sample-audit
node packages/migration-cli/dist/index.js dry-run packages/test-fixtures/fixtures/sample-wxr.xml --source wxr --output-dir artifacts/sample-dry-run
```

## Lưu ý

- nếu chưa `build`, binary `wp2emdash` trong `dist` sẽ chưa có
- REST source thật cần mạng và hiện chưa có auth flow riêng
