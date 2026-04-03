# Module Responsibilities

## `connectors/rest.ts`

- Responsibility: load và normalize dữ liệu từ WordPress REST API
- Inputs: base URL hoặc `wp-json` URL
- Outputs: `WordPressSourceBundle`
- Dependencies: `zod`, `fetch`, `shared-types`
- Extension points: auth, retry, timeout, extra endpoint handling

## `connectors/wxr.ts`

- Responsibility: đọc file WXR từ filesystem
- Inputs: path tới `.xml`
- Outputs: `WordPressSourceBundle`
- Dependencies: `parsers/wxr.ts`
- Extension points: file validation, richer metadata extraction

## `parsers/wxr.ts`

- Responsibility: parse XML và map sang source bundle
- Inputs: WXR XML string
- Outputs: `WordPressSourceBundle`
- Dependencies: `fast-xml-parser`, `utils/collections`
- Extension points: attachment metadata, comment/meta parsing

## `parsers/gutenberg.ts`

- Responsibility: parse block document Gutenberg
- Inputs: raw content string
- Outputs: `GutenbergBlock[]`
- Dependencies: `@wordpress/block-serialization-default-parser`
- Extension points: block introspection helpers

## `auditors/audit-source.ts`

- Responsibility: tổng hợp inventory, issues, hints, recommendation
- Inputs: `WordPressSourceBundle`
- Outputs: `AuditResult`
- Dependencies: parser Gutenberg, detectors, scoring
- Extension points: new detectors, new report fields

## `auditors/difficulty.ts`

- Responsibility: tính score và recommendation
- Inputs: aggregate counts/risk signals
- Outputs: `DifficultyScore`, `MigrationRecommendation`
- Dependencies: `shared-types`
- Extension points: recalibration logic

## `auditors/heuristics.ts`

- Responsibility: builder/plugin hint heuristics
- Inputs: item content, shortcodes, block names
- Outputs: `BuilderOrPluginHint[]`
- Dependencies: none ngoài contracts
- Extension points: matcher registry

## `transformers/structured-transform.ts`

- Responsibility: item-level transform orchestration
- Inputs: `WordPressContentItem`
- Outputs: `TransformResult`
- Dependencies: Gutenberg parser, shortcode/risk detectors, block transform
- Extension points: pre/post transform hooks

## `transformers/block-transformers.ts`

- Responsibility: map block sang `StructuredNode`
- Inputs: `GutenbergBlock`
- Outputs: `StructuredNode[]`
- Dependencies: HTML helper, risk detector
- Extension points: thêm block rule, fallback strategy

## `transformers/shortcodes.ts`

- Responsibility: detect shortcode và risky content signals
- Inputs: raw content
- Outputs: shortcode list và embed/script flags
- Dependencies: regex only
- Extension points: richer parsing, shortcode metadata

## `planners/create-import-plan.ts`

- Responsibility: map transform output sang import plan
- Inputs: source bundle, transform results, optional target URL
- Outputs: `ImportPlan`
- Dependencies: collection mapper
- Extension points: configurable collection mapping, richer rewrite planning

## `planners/write-artifacts.ts`

- Responsibility: ghi file artifact ra output dir
- Inputs: audit, transform, import plan
- Outputs: `PipelineArtifactsSummary`
- Dependencies: reporters, filesystem utils
- Extension points: schema versioning, optional extra artifacts

## `reporters/*`

- Responsibility: render Markdown và CSV
- Inputs: audit/plan/manual fix data
- Outputs: file content strings
- Dependencies: contracts only
- Extension points: richer report sections, localized output

## `adapters/emdash-target.ts`

- Responsibility: boundary cho target EmDash
- Inputs: `ImportPlan`, target URL
- Outputs: adapter result note
- Dependencies: contracts only
- Extension points: live import implementation

## `pipeline.ts`

- Responsibility: nối các bước thành flows `audit`, `dry-run`, `import`
- Inputs: command options
- Outputs: `PipelineExecutionResult`
- Dependencies: almost all core modules
- Extension points: new command flows
