export type SourceKind = "wxr" | "api";

export interface SiteMetadata {
  name: string;
  url: string;
  description?: string;
  exportedAt?: string;
  generator?: string;
  sourceKind: SourceKind;
}

export interface WordPressAuthor {
  id: string;
  login: string;
  email?: string;
  displayName: string;
}

export interface TaxonomyTerm {
  id: string;
  taxonomy: string;
  slug: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface MediaAsset {
  id: string;
  slug: string;
  title: string;
  sourceUrl: string;
  mimeType?: string;
  altText?: string;
  caption?: string;
  description?: string;
  authorId?: string;
}

export interface WordPressContentItem {
  id: string;
  type: string;
  slug: string;
  title: string;
  excerpt?: string;
  rawContent: string;
  status: string;
  publishedAt?: string;
  modifiedAt?: string;
  authorId?: string;
  sourceUrl?: string;
  featuredMediaId?: string;
  taxonomyTermIds: string[];
}

export interface CustomPostTypeFinding {
  slug: string;
  label: string;
  itemCount: number;
}

export interface WordPressSourceBundle {
  site: SiteMetadata;
  authors: WordPressAuthor[];
  taxonomyTerms: TaxonomyTerm[];
  media: MediaAsset[];
  contentItems: WordPressContentItem[];
  customPostTypes: CustomPostTypeFinding[];
}

export type StructuredNode =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; level: number; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "quote"; text: string; citation?: string }
  | { kind: "image"; url: string; alt?: string; caption?: string; mediaId?: string }
  | { kind: "gallery"; images: Array<{ url: string; alt?: string; mediaId?: string }> }
  | { kind: "embed"; url?: string; provider?: string; html?: string }
  | { kind: "code"; code: string; language?: string }
  | { kind: "separator" }
  | { kind: "table"; rows: string[][] }
  | { kind: "html"; rawHtml: string }
  | {
      kind: "fallback";
      label: string;
      blockName: string;
      rawPayload: string;
    };

export interface TransformWarning {
  code:
    | "SHORTCODE_FOUND"
    | "RAW_HTML_BLOCK"
    | "EMBED_FOUND"
    | "SCRIPT_FOUND"
    | "UNSUPPORTED_BLOCK"
    | "UNKNOWN_BLOCK"
    | "EMPTY_CONTENT";
  message: string;
  severity: "info" | "warning" | "error";
}

export interface UnsupportedNode {
  blockName: string;
  reason: string;
  rawPayload: string;
}

export interface FallbackBlock {
  blockName: string;
  label: string;
  rawPayload: string;
}

export interface ShortcodeOccurrence {
  name: string;
  raw: string;
}

export interface TransformResult {
  itemId: string;
  sourceType: string;
  structuredContent: StructuredNode[];
  warnings: TransformWarning[];
  unsupportedNodes: UnsupportedNode[];
  fallbackBlocks: FallbackBlock[];
  shortcodes: ShortcodeOccurrence[];
  embeddedAssetRefs: string[];
}

export interface BlockInventoryEntry {
  blockName: string;
  count: number;
  supported: boolean;
}

export interface BuilderOrPluginHint {
  kind: "builder" | "plugin";
  name: string;
  confidence: "low" | "medium" | "high";
  evidence: string[];
}

export interface AuditIssue {
  itemId: string;
  itemType: string;
  severity: "warning" | "error";
  reason: string;
  detail: string;
}

export interface DifficultyScore {
  level: "Low" | "Medium" | "High";
  score: number;
  reasons: string[];
}

export type MigrationRecommendation =
  | "ready for import"
  | "import with manual cleanup"
  | "rebuild recommended";

export interface AuditResult {
  generatedAt: string;
  source: SiteMetadata;
  contentCounts: Record<string, number>;
  blockInventory: BlockInventoryEntry[];
  shortcodeInventory: Array<{ shortcode: string; count: number }>;
  builderHints: BuilderOrPluginHint[];
  pluginHints: BuilderOrPluginHint[];
  customPostTypeFindings: CustomPostTypeFinding[];
  unsupportedItems: AuditIssue[];
  difficulty: DifficultyScore;
  recommendation: MigrationRecommendation;
}

export interface ImportEntryPlan {
  sourceId: string;
  sourceType: string;
  targetCollection: string;
  slug: string;
  title: string;
  status: string;
  content: StructuredNode[];
  authorId?: string;
  taxonomyTermIds: string[];
  warnings: string[];
}

export interface MediaImportPlan {
  sourceId: string;
  url: string;
  filename: string;
  mimeType?: string;
  altText?: string;
}

export interface RewriteSuggestion {
  sourceUrl: string;
  suggestedTargetPath: string;
}

export interface UnresolvedImportItem {
  sourceId: string;
  sourceType: string;
  reason: string;
  severity: "warning" | "error";
}

export interface ManualFixRecord {
  sourceId: string;
  sourceType: string;
  reason: string;
  detail: string;
}

export interface ImportPlan {
  generatedAt: string;
  target?: string;
  collections: Array<{ sourceType: string; targetCollection: string; count: number }>;
  entriesToCreate: ImportEntryPlan[];
  mediaToImport: MediaImportPlan[];
  rewriteSuggestions: RewriteSuggestion[];
  unresolvedItems: UnresolvedImportItem[];
  manualFixes: ManualFixRecord[];
}

export interface GeneratedArtifacts {
  outputDir: string;
  auditResultPath: string;
  transformPreviewPath?: string;
  importPlanPath?: string;
  migrationReportPath: string;
  manualFixesCsvPath?: string;
  summaryPath: string;
}

export interface PipelineArtifactsSummary {
  source: SiteMetadata;
  totalItems: number;
  transformedItems: number;
  unresolvedItems: number;
  recommendation: MigrationRecommendation;
  difficulty: DifficultyScore;
  outputs: GeneratedArtifacts;
}

export interface LoadSourceOptions {
  sourceKind: SourceKind;
  input: string;
}
