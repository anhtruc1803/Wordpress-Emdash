# Domain Model

## `WordPressSourceBundle`

Đây là normalized source model trung tâm.

Thành phần:

- `site`
- `authors`
- `taxonomyTerms`
- `media`
- `contentItems`
- `customPostTypes`

Vai trò:

- là đầu ra chuẩn của tất cả source connector
- là đầu vào cho audit và transform/planning

## `AuditResult`

Mô tả sức khỏe migration ở mức site.

Gồm:

- `contentCounts`
- `blockInventory`
- `shortcodeInventory`
- `builderHints`
- `pluginHints`
- `customPostTypeFindings`
- `unsupportedItems`
- `difficulty`
- `recommendation`

Quan hệ:

- được tạo trực tiếp từ `WordPressSourceBundle`
- có thể đứng độc lập để generate report lại bằng command `report`

## `TransformResult`

Mô tả kết quả transform của một content item.

Gồm:

- `structuredContent`
- `warnings`
- `unsupportedNodes`
- `fallbackBlocks`
- `shortcodes`
- `embeddedAssetRefs`

Quan hệ:

- được tạo từ `WordPressContentItem`
- được dùng tiếp trong `ImportPlan`

## `ImportPlan`

Mô tả site sẽ được import như thế nào vào target tương lai.

Gồm:

- `collections`
- `entriesToCreate`
- `mediaToImport`
- `rewriteSuggestions`
- `unresolvedItems`
- `manualFixes`

Quan hệ:

- được tạo từ `WordPressSourceBundle` + `TransformResult[]`
- là artifact quan trọng nhất cho bước tích hợp sau MVP

## `GeneratedArtifacts`

Danh sách đường dẫn file đầu ra.

Hiện gồm:

- `auditResultPath`
- `transformPreviewPath` nếu có
- `importPlanPath` nếu có
- `migrationReportPath`
- `manualFixesCsvPath` nếu có
- `summaryPath`

## Quan hệ giữa các model

```text
source connector
  -> WordPressSourceBundle
    -> AuditResult
    -> TransformResult[]
       + WordPressSourceBundle
         -> ImportPlan
            -> GeneratedArtifacts + summary
```

## Điều model hiện chưa làm

- không chứa schema version
- không có explicit target content schema cho EmDash
- không có provenance sâu tới từng block span/offset
