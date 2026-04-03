# Codebase Index

## Annotated repo tree

```text
.
├─ package.json                      # workspace scripts: build, typecheck, test
├─ pnpm-workspace.yaml               # pnpm workspace config
├─ tsconfig.base.json                # shared TS config
├─ packages/
│  ├─ shared-types/
│  │  └─ src/index.ts                # central domain contracts
│  ├─ migration-core/
│  │  └─ src/
│  │     ├─ pipeline.ts              # orchestration entry for core flows
│  │     ├─ connectors/              # source loaders for WXR and REST
│  │     ├─ parsers/                 # WXR and Gutenberg parsing
│  │     ├─ auditors/                # audit engine, heuristics, scoring
│  │     ├─ transformers/            # semantic transform + warnings
│  │     ├─ planners/                # import plan and artifact writing
│  │     ├─ reporters/               # markdown/csv renderers
│  │     ├─ mappers/                 # source-to-target collection mapping
│  │     ├─ adapters/                # target adapter boundary
│  │     └─ __tests__/               # unit/integration-lite tests
│  ├─ migration-cli/
│  │  └─ src/index.ts                # wp2emdash CLI entry
│  └─ test-fixtures/
│     └─ fixtures/                   # sample WXR and REST payloads
├─ docs/                             # human-oriented architecture/guides/audit/roadmap
├─ agent/                            # AI-agent-specific handoff and edit guidance
└─ audit/                            # deeper technical audit documents
```

## Package responsibilities

- `@wp2emdash/shared-types`: domain contracts và artifact shapes
- `@wp2emdash/migration-core`: business logic thực
- `@wp2emdash/migration-cli`: command parsing và user-facing execution
- `@wp2emdash/test-fixtures`: fixtures phục vụ test

## Entry points

- CLI: [packages/migration-cli/src/index.ts](C:/Users/anhtr/Documents/WP/packages/migration-cli/src/index.ts)
- Core orchestration: [packages/migration-core/src/pipeline.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/pipeline.ts)
- Core public API: [packages/migration-core/src/index.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/index.ts)
- Contracts: [packages/shared-types/src/index.ts](C:/Users/anhtr/Documents/WP/packages/shared-types/src/index.ts)

## Top 10 file nên đọc trước

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

## Suggested reading order

1. Product/context docs
2. Shared types
3. Pipeline orchestration
4. Source connectors and parsers
5. Audit and transform
6. Planner and reporters
7. CLI
8. Tests

## Dependency direction

```text
migration-cli
  -> migration-core
    -> shared-types

migration-core/connectors|parsers|auditors|transformers|planners|reporters|adapters
  -> shared-types

tests
  -> migration-core
  -> test-fixtures
```

## Orchestration files

- [pipeline.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/pipeline.ts)
- [migration-cli/index.ts](C:/Users/anhtr/Documents/WP/packages/migration-cli/src/index.ts)

## Pure logic files

- [auditors/difficulty.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/auditors/difficulty.ts)
- [transformers/shortcodes.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/transformers/shortcodes.ts)
- [mappers/collection-mapper.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/mappers/collection-mapper.ts)

## Output/reporting files

- [reporters/markdown-report.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/reporters/markdown-report.ts)
- [reporters/manual-fixes-csv.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/reporters/manual-fixes-csv.ts)
- [planners/write-artifacts.ts](C:/Users/anhtr/Documents/WP/packages/migration-core/src/planners/write-artifacts.ts)
