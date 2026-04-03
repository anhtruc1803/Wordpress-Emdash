# System Map

## Entry points

- CLI: [packages/migration-cli/src/index.ts](C:/Users/anhtr/Documents/WP/packages/migration-cli/src/index.ts)
- Core pipeline: [packages/migration-core/src/pipeline.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/pipeline.ts)
- Type contracts: [packages/shared-types/src/index.ts](C:/Users/anhtr/Documents/WP/packages/shared-types/src/index.ts)

## Top 10 files

1. [packages/shared-types/src/index.ts](C:/Users/anhtr/Documents/WP/packages/shared-types/src/index.ts)
2. [packages/migration-core/src/pipeline.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/pipeline.ts)
3. [packages/migration-cli/src/index.ts](C:/Users/anhtr/Documents/WP/packages/migration-cli/src/index.ts)
4. [packages/migration-core/src/connectors/rest.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/connectors/rest.ts)
5. [packages/migration-core/src/parsers/wxr.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/parsers/wxr.ts)
6. [packages/migration-core/src/auditors/audit-source.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/auditors/audit-source.ts)
7. [packages/migration-core/src/transformers/structured-transform.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/transformers/structured-transform.ts)
8. [packages/migration-core/src/transformers/block-transformers.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/transformers/block-transformers.ts)
9. [packages/migration-core/src/planners/create-import-plan.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/planners/create-import-plan.ts)
10. [packages/migration-core/src/planners/write-artifacts.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/planners/write-artifacts.ts)

## Recommended reading order

```text
README
  -> shared-types
  -> pipeline
  -> source connectors/parsers
  -> audit
  -> transform
  -> planning/reporting
  -> CLI
  -> tests
```

## Dependency graph

```text
shared-types
  <- migration-core
      <- migration-cli

migration-core/pipeline
  -> connectors
  -> auditors
  -> transformers
  -> planners
  -> reporters
  -> adapters
```

## Orchestration files

- `pipeline.ts`
- `migration-cli/src/index.ts`

## Pure logic files

- `difficulty.ts`
- `shortcodes.ts`
- `collection-mapper.ts`
- `utils/*`

## Output/report files

- `markdown-report.ts`
- `manual-fixes-csv.ts`
- `write-artifacts.ts`
