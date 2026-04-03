# High Risk Zones

## `packages/shared-types/src/index.ts`

Vì sao rủi ro:

- là contract layer dùng khắp repo
- đổi field có thể phá type, planner, reporter, CLI và tests cùng lúc

## `packages/migration-core/src/pipeline.ts`

Vì sao rủi ro:

- là orchestration point của cả ba flow `audit`, `dry-run`, `import`
- đổi behavior ở đây tác động trực tiếp tới artifact và CLI expectations

## Parser -> transformer -> planner chain

Các file:

- [parsers/wxr.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/parsers/wxr.ts)
- [connectors/rest.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/connectors/rest.ts)
- [transformers/structured-transform.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/transformers/structured-transform.ts)
- [planners/create-import-plan.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/planners/create-import-plan.ts)

Rủi ro:

- thay đổi upstream có thể làm counts, warnings, unresolved items và report lệch cùng lúc

## CLI surface

File:

- [packages/migration-cli/src/index.ts](C:/Users/anhtr/Documents/WP/packages/migration-cli/src/index.ts)

Rủi ro:

- đổi option/command sẽ ảnh hưởng docs, onboarding và cách gọi automation/agents

## Report format

Files:

- `markdown-report.ts`
- `manual-fixes-csv.ts`
- `write-artifacts.ts`

Rủi ro:

- format đổi mà không ghi chú sẽ làm downstream review/handoff khó theo dõi
