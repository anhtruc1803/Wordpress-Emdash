import type {
  ImportExecutionResult,
  ImportFailure,
  ImportPlan,
  StructuredNode,
  TaxonomyTerm,
  WordPressSourceBundle
} from "@wp2emdash/shared-types";

import {
  EmDashDirectUploadUnsupportedError,
  EmDashApiClient,
  type EmDashFieldRecord,
  type EmDashFieldType,
  type EmDashTargetRequest
} from "./emdash-api.js";
import { convertStructuredNodesToPortableText } from "./portable-text.js";

interface CollectionFieldSpec {
  slug: string;
  label: string;
  type: Extract<EmDashFieldType, "string" | "text" | "json" | "datetime" | "portableText">;
  required?: boolean;
  searchable?: boolean;
}

interface CollectionImportContext {
  contentField: {
    slug: string;
    type: EmDashFieldType;
  };
  metadataField: {
    slug: string;
    type: EmDashFieldType;
  };
  fieldsBySlug: Map<string, EmDashFieldRecord>;
}

interface TaxonomySpec {
  name: string;
  label: string;
  hierarchical: boolean;
  collections: string[];
  terms: TaxonomyTerm[];
}

export interface EmDashTargetAdapter {
  execute(
    plan: ImportPlan,
    bundle: WordPressSourceBundle,
    target: EmDashTargetRequest
  ): Promise<ImportExecutionResult>;
}

export class PlanningOnlyEmDashTargetAdapter implements EmDashTargetAdapter {
  async execute(
    plan: ImportPlan,
    _bundle: WordPressSourceBundle,
    target: EmDashTargetRequest
  ): Promise<ImportExecutionResult> {
    return {
      mode: "planned",
      target: target.url,
      importedAt: new Date().toISOString(),
      note: `Generated import plan for ${plan.entriesToCreate.length} entries targeting ${target.url}. Configure an EmDash API token to run a live import.`,
      collections: [],
      fields: [],
      taxonomies: [],
      terms: [],
      media: [],
      entries: [],
      failures: []
    };
  }
}

export class LiveEmDashTargetAdapter implements EmDashTargetAdapter {
  async execute(
    plan: ImportPlan,
    bundle: WordPressSourceBundle,
    target: EmDashTargetRequest
  ): Promise<ImportExecutionResult> {
    const importedAt = new Date().toISOString();
    const failures: ImportFailure[] = [];
    const result: ImportExecutionResult = {
      mode: "imported",
      target: target.url,
      importedAt,
      note: "",
      collections: [],
      fields: [],
      taxonomies: [],
      terms: [],
      media: [],
      entries: [],
      failures
    };

    if (!target.apiToken) {
      throw new Error("An EmDash API token is required for live import.");
    }

    const client = new EmDashApiClient(target);
    const bundleItemsById = new Map(bundle.contentItems.map((item) => [item.id, item]));
    const taxonomyTermsById = new Map(bundle.taxonomyTerms.map((term) => [term.id, term]));
    const unresolvedByItemId = new Map(
      plan.unresolvedItems.map((item) => [item.sourceId, item])
    );

    const collectionSpecs = buildCollectionFieldSpecs(plan, bundle);
    const existingCollections = await client.listCollections();
    const knownCollections = new Set(existingCollections.map((collection) => collection.slug));
    const collectionContexts = new Map<string, CollectionImportContext>();

    for (const [collection, fields] of collectionSpecs.entries()) {
      if (knownCollections.has(collection)) {
        result.collections.push({ collection, created: false });
      } else {
        await client.createCollection({
          slug: collection,
          label: humanizeLabel(collection),
          labelSingular: humanizeSingularLabel(collection),
          supports: ["drafts", "revisions", "search"],
          source: "import:wp2emdash"
        });
        result.collections.push({ collection, created: true });
      }

      const existingFields = await client.listFields(collection);
      const fieldTypesBySlug = new Map(existingFields.map((field) => [field.slug, field]));
      const contentField = resolveContentField(collection, fields, existingFields);
      const metadataField = resolveMetadataField(fields, existingFields);

      for (const field of fields) {
        const existingField = fieldTypesBySlug.get(field.slug);
        if (existingField) {
          result.fields.push({ collection, field: field.slug, created: false });
          continue;
        }

        await createFieldWithPortableTextFallback(client, collection, field);
        result.fields.push({ collection, field: field.slug, created: true });
      }

      const fieldsBySlug = new Map(existingFields.map((field) => [field.slug, field]));
      for (const field of fields) {
        if (!fieldsBySlug.has(field.slug)) {
          fieldsBySlug.set(field.slug, {
            slug: field.slug,
            label: field.label,
            type: field.type,
            required: field.required ?? false,
            searchable: field.searchable ?? false,
            defaultValue: null
          });
        }
      }

      collectionContexts.set(collection, {
        contentField,
        metadataField,
        fieldsBySlug
      });
    }

    const taxonomySpecs = buildTaxonomySpecs(plan, bundle);
    const taxonomyTermIdMap = await this.syncTaxonomies(client, taxonomySpecs, result, failures);

    const mediaSourceIdToMediaId = new Map<string, string>();
    const mediaSourceUrlToMediaId = new Map<string, string>();

    for (const media of plan.mediaToImport) {
      try {
        const importedMedia = await client.importMedia(media);
        if (importedMedia.mediaId) {
          mediaSourceIdToMediaId.set(media.sourceId, importedMedia.mediaId);
          mediaSourceUrlToMediaId.set(importedMedia.sourceUrl, importedMedia.mediaId);
        }
        result.media.push(importedMedia);
      } catch (error) {
        if (error instanceof EmDashDirectUploadUnsupportedError) {
          result.media.push({
            sourceId: media.sourceId,
            filename: media.filename,
            sourceUrl: media.url,
            reused: false
          });
          continue;
        }
        failures.push({
          stage: "media",
          sourceId: media.sourceId,
          message: asErrorMessage(error)
        });
      }
    }

    for (const entry of plan.entriesToCreate) {
      const unresolved = unresolvedByItemId.get(entry.sourceId);
      if (unresolved?.severity === "error") {
        result.entries.push({
          sourceId: entry.sourceId,
          collection: entry.targetCollection,
          slug: entry.slug,
          status: "skipped",
          reason: unresolved.reason
        });
        continue;
      }

      const sourceItem = bundleItemsById.get(entry.sourceId);
      if (!sourceItem) {
        failures.push({
          stage: "entry",
          sourceId: entry.sourceId,
          collection: entry.targetCollection,
          message: "Source item was not found in the bundle."
        });
        continue;
      }

      const rewrittenContent = rewriteStructuredNodes(
        entry.content,
        mediaSourceIdToMediaId,
        mediaSourceUrlToMediaId
      );
      const portableTextConversion = convertStructuredNodesToPortableText(rewrittenContent);
      const mappedTaxonomyTerms = entry.taxonomyTermIds
        .map((termId) => taxonomyTermsById.get(termId))
        .filter((term): term is NonNullable<typeof term> => Boolean(term))
        .map((term) => {
          const taxonomyName = mapWordPressTaxonomyName(term.taxonomy);
          return {
            id: term.id,
            taxonomy: taxonomyName,
            slug: term.slug,
            name: term.name,
            emdashTermId: taxonomyTermIdMap.get(term.id) ?? null
          };
        });

      const migrationMeta = {
        sourceId: entry.sourceId,
        sourceType: entry.sourceType,
        sourceUrl: sourceItem.sourceUrl ?? null,
        sourceStatus: sourceItem.status,
        authorId: entry.authorId ?? null,
        taxonomyTerms: mappedTaxonomyTerms,
        warnings: entry.warnings,
        structuredContentBackup: rewrittenContent,
        portableTextSkippedNodes: portableTextConversion.unsupportedNodes
      };
      const collectionContext = collectionContexts.get(entry.targetCollection);
      const contentField = collectionContext?.contentField ?? {
        slug: "body",
        type: "portableText" as const
      };
      const metadataField = collectionContext?.metadataField ?? {
        slug: "migration_meta",
        type: "json" as const
      };
      const authorName = resolveAuthorName(bundle, entry.authorId);
      const fullEntryData = buildEntryData({
        entry,
        sourceItem,
        rewrittenContent,
        portableTextConversion,
        migrationMeta,
        collectionContext,
        contentField,
        metadataField,
        primaryMediaId: resolvePrimaryMediaId(sourceItem, mediaSourceIdToMediaId, mediaSourceUrlToMediaId),
        primaryMediaUrl: resolvePrimaryMediaUrl(sourceItem, mediaSourceIdToMediaId, mediaSourceUrlToMediaId, bundle),
        authorName,
        taxonomyTerms: mappedTaxonomyTerms
      });
      const createEntryData = buildCreateEntryData(fullEntryData, collectionContext, contentField);
      const primaryCreatePayload = {
        slug: entry.slug,
        status: mapWordPressStatusToEmDashStatus(entry.status),
        data: createEntryData
      };

      try {
        const existingEntry = await client.getContent(entry.targetCollection, entry.slug);
        let created = existingEntry ?? undefined;

        if (existingEntry?.id) {
          await client.updateContent(entry.targetCollection, existingEntry.id, {
            slug: entry.slug,
            status: mapWordPressStatusToEmDashStatus(entry.status),
            data: fullEntryData
          });

          result.entries.push({
            sourceId: entry.sourceId,
            collection: entry.targetCollection,
            slug: entry.slug,
            entryId: existingEntry.id,
            status: "imported"
          });
          continue;
        }

        try {
          created = await client.createContent(entry.targetCollection, primaryCreatePayload);
        } catch (primaryError) {
          const conflictingEntry = await client.getContent(entry.targetCollection, entry.slug);
          if (conflictingEntry?.id) {
            await client.updateContent(entry.targetCollection, conflictingEntry.id, {
              slug: entry.slug,
              status: mapWordPressStatusToEmDashStatus(entry.status),
              data: fullEntryData
            });

            result.entries.push({
              sourceId: entry.sourceId,
              collection: entry.targetCollection,
              slug: entry.slug,
              entryId: conflictingEntry.id,
              status: "imported"
            });
            continue;
          }

          const minimalCreatePayload = {
            slug: entry.slug,
            status: mapWordPressStatusToEmDashStatus(entry.status),
            data: { title: entry.title }
          };
          const shouldRetryMinimal =
            Object.keys(createEntryData).some((key) => key !== "title");

          if (!shouldRetryMinimal) {
            throw primaryError;
          }

          try {
            created = await client.createContent(entry.targetCollection, minimalCreatePayload);
          } catch (minimalError) {
            const recoveredEntry = await client.getContent(entry.targetCollection, entry.slug);
            if (recoveredEntry?.id) {
              await client.updateContent(entry.targetCollection, recoveredEntry.id, {
                slug: entry.slug,
                status: mapWordPressStatusToEmDashStatus(entry.status),
                data: fullEntryData
              });

              result.entries.push({
                sourceId: entry.sourceId,
                collection: entry.targetCollection,
                slug: entry.slug,
                entryId: recoveredEntry.id,
                status: "imported"
              });
              continue;
            }

            throw new Error(
              buildCreateFailureMessage(
                minimalError,
                collectionContext,
                contentField,
                fullEntryData
              )
            );
          }
        }

        const shouldEnrichEntry = !areRecordValuesEqual(createEntryData, fullEntryData);
        if (shouldEnrichEntry) {
          try {
            await client.updateContent(entry.targetCollection, created.id, {
              status: mapWordPressStatusToEmDashStatus(entry.status),
              data: fullEntryData
            });
          } catch (updateError) {
            failures.push({
              stage: "entry",
              sourceId: entry.sourceId,
              collection: entry.targetCollection,
              message: buildUpdateFailureMessage(updateError, collectionContext, fullEntryData)
            });
          }
        }

        result.entries.push({
          sourceId: entry.sourceId,
          collection: entry.targetCollection,
          slug: entry.slug,
          entryId: created.id,
          status: "imported"
        });
      } catch (error) {
        failures.push({
          stage: "entry",
          sourceId: entry.sourceId,
          collection: entry.targetCollection,
          message: buildCreateFailureMessage(error, collectionContext, contentField, fullEntryData)
        });
      }
    }

    result.note = buildImportSummaryNote(result);
    return result;
  }

  private async syncTaxonomies(
    client: EmDashApiClient,
    specs: TaxonomySpec[],
    result: ImportExecutionResult,
    failures: ImportFailure[]
  ): Promise<Map<string, string>> {
    const taxonomyTermIdMap = new Map<string, string>();
    if (specs.length === 0) {
      return taxonomyTermIdMap;
    }

    const existingTaxonomies = await client.listTaxonomies();
    const existingTaxonomiesByName = new Map(
      existingTaxonomies.map((taxonomy) => [taxonomy.name, taxonomy])
    );

    for (const spec of specs) {
      const existingTaxonomy = existingTaxonomiesByName.get(spec.name);
      if (existingTaxonomy) {
        result.taxonomies.push({
          taxonomy: spec.name,
          created: false,
          collections: spec.collections
        });
      } else {
        try {
          await client.createTaxonomy({
            name: spec.name,
            label: spec.label,
            hierarchical: spec.hierarchical,
            collections: spec.collections
          });
          result.taxonomies.push({
            taxonomy: spec.name,
            created: true,
            collections: spec.collections
          });
        } catch (error) {
          failures.push({
            stage: "taxonomy",
            collection: spec.collections.join(","),
            message: `${spec.name}: ${asErrorMessage(error)}`
          });
          continue;
        }
      }

      const termIdBySlug = new Map<string, string>();
      try {
        const existingTerms = await client.listTerms(spec.name);
        for (const term of existingTerms) {
          termIdBySlug.set(term.slug, term.id);
        }
      } catch (error) {
        failures.push({
          stage: "term",
          collection: spec.collections.join(","),
          message: `Unable to list terms for taxonomy ${spec.name}: ${asErrorMessage(error)}`
        });
        continue;
      }

      const termsById = new Map(spec.terms.map((term) => [term.id, term]));
      const visiting = new Set<string>();

      const ensureTerm = async (termId: string): Promise<string | undefined> => {
        const existingId = taxonomyTermIdMap.get(termId);
        if (existingId) {
          return existingId;
        }

        const term = termsById.get(termId);
        if (!term) {
          return undefined;
        }
        if (visiting.has(termId)) {
          failures.push({
            stage: "term",
            sourceId: term.id,
            message: `Detected a cyclic taxonomy parent relationship for ${term.slug}.`
          });
          return undefined;
        }

        const existingTermId = termIdBySlug.get(term.slug);
        if (existingTermId) {
          taxonomyTermIdMap.set(term.id, existingTermId);
          result.terms.push({
            taxonomy: spec.name,
            slug: term.slug,
            termId: existingTermId,
            created: false
          });
          return existingTermId;
        }

        visiting.add(termId);
        const parentId =
          term.parentId && spec.hierarchical ? await ensureTerm(term.parentId) : undefined;
        visiting.delete(termId);

        try {
          const created = await client.createTerm(spec.name, {
            slug: term.slug,
            label: term.name,
            ...(term.description ? { description: term.description } : {}),
            ...(parentId ? { parentId } : {})
          });
          taxonomyTermIdMap.set(term.id, created.id);
          termIdBySlug.set(term.slug, created.id);
          result.terms.push({
            taxonomy: spec.name,
            slug: term.slug,
            termId: created.id,
            created: true
          });
          return created.id;
        } catch (error) {
          failures.push({
            stage: "term",
            sourceId: term.id,
            message: `${spec.name}/${term.slug}: ${asErrorMessage(error)}`
          });
          return undefined;
        }
      };

      for (const term of spec.terms) {
        await ensureTerm(term.id);
      }
    }

    return taxonomyTermIdMap;
  }
}

export function createEmDashTargetAdapter(
  target: EmDashTargetRequest
): EmDashTargetAdapter {
  if (target.apiToken) {
    return new LiveEmDashTargetAdapter();
  }

  return new PlanningOnlyEmDashTargetAdapter();
}

function buildCollectionFieldSpecs(
  plan: ImportPlan,
  bundle: WordPressSourceBundle
): Map<string, CollectionFieldSpec[]> {
  const bundleById = new Map(bundle.contentItems.map((item) => [item.id, item]));
  const result = new Map<string, CollectionFieldSpec[]>();

  for (const collection of plan.collections) {
    const relatedEntries = plan.entriesToCreate.filter(
      (entry) => entry.targetCollection === collection.targetCollection
    );
    const sourceItems = relatedEntries
      .map((entry) => bundleById.get(entry.sourceId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const fields: CollectionFieldSpec[] = [
      {
        slug: "title",
        label: "Title",
        type: "string",
        required: true,
        searchable: true
      },
      {
        slug: "body",
        label: "Body",
        type: "portableText",
        required: true
      },
      {
        slug: "migration_meta",
        label: "Migration metadata",
        type: "json"
      }
    ];

    if (sourceItems.some((item) => Boolean(item.excerpt))) {
      fields.push({
        slug: "migration_excerpt",
        label: "Migration excerpt",
        type: "text"
      });
    }

    if (sourceItems.some((item) => Boolean(item.sourceUrl))) {
      fields.push({
        slug: "migration_source_url",
        label: "Migration source URL",
        type: "string"
      });
    }

    if (sourceItems.some((item) => Boolean(item.publishedAt))) {
      fields.push({
        slug: "migration_published_at",
        label: "Migration published at",
        type: "datetime"
      });
    }

    result.set(collection.targetCollection, fields);
  }

  return result;
}

function buildTaxonomySpecs(
  plan: ImportPlan,
  bundle: WordPressSourceBundle
): TaxonomySpec[] {
  const collectionsByTermId = new Map<string, Set<string>>();
  for (const entry of plan.entriesToCreate) {
    for (const termId of entry.taxonomyTermIds) {
      const collections = collectionsByTermId.get(termId) ?? new Set<string>();
      collections.add(entry.targetCollection);
      collectionsByTermId.set(termId, collections);
    }
  }

  const groupedTerms = new Map<string, TaxonomyTerm[]>();
  for (const term of bundle.taxonomyTerms) {
    const taxonomyName = mapWordPressTaxonomyName(term.taxonomy);
    const terms = groupedTerms.get(taxonomyName) ?? [];
    terms.push(term);
    groupedTerms.set(taxonomyName, terms);
  }

  return Array.from(groupedTerms.entries()).map(([taxonomyName, terms]) => {
    const collections = Array.from(
      new Set(
        terms.flatMap((term) => Array.from(collectionsByTermId.get(term.id) ?? new Set<string>()))
      )
    );

    return {
      name: taxonomyName,
      label: humanizeLabel(taxonomyName),
      hierarchical: terms.some((term) => term.taxonomy === "category" || Boolean(term.parentId)),
      collections,
      terms
    };
  });
}

function rewriteStructuredNodes(
  nodes: StructuredNode[],
  mediaSourceIdToMediaId: Map<string, string>,
  mediaSourceUrlToMediaId: Map<string, string>
): StructuredNode[] {
  return nodes.map((node) => {
    if (node.kind === "image") {
      return {
        ...node,
        mediaId:
          (node.mediaId ? mediaSourceIdToMediaId.get(node.mediaId) : undefined) ??
          mediaSourceUrlToMediaId.get(node.url) ??
          node.mediaId
      };
    }

    if (node.kind === "gallery") {
      return {
        ...node,
        images: node.images.map((image) => ({
          ...image,
          mediaId:
            (image.mediaId ? mediaSourceIdToMediaId.get(image.mediaId) : undefined) ??
            mediaSourceUrlToMediaId.get(image.url) ??
            image.mediaId
        }))
      };
    }

    return node;
  });
}

async function createFieldWithPortableTextFallback(
  client: EmDashApiClient,
  collection: string,
  field: CollectionFieldSpec
): Promise<void> {
  try {
    await client.createField(collection, field);
  } catch (error) {
    if (field.type !== "portableText") {
      throw error;
    }

    await client.createField(collection, {
      ...field,
      type: "json"
    });
  }
}

function resolveContentField(
  collection: string,
  plannedFields: CollectionFieldSpec[],
  existingFields: EmDashFieldRecord[]
): CollectionImportContext["contentField"] {
  const preferred = ["body", "content", "migration_content"];
  for (const slug of preferred) {
    const existing = existingFields.find((field) => field.slug === slug);
    if (existing) {
      return {
        slug,
        type: normalizeFieldType(existing.type)
      };
    }
  }

  const planned = plannedFields.find((field) => preferred.includes(field.slug));
  if (planned) {
    return {
      slug: planned.slug,
      type: planned.type
    };
  }

  return {
    slug: collection === "posts" ? "body" : "body",
    type: "portableText"
  };
}

function resolveMetadataField(
  plannedFields: CollectionFieldSpec[],
  existingFields: EmDashFieldRecord[]
): CollectionImportContext["metadataField"] {
  const existing = existingFields.find((field) => field.slug === "migration_meta");
  if (existing) {
    return {
      slug: "migration_meta",
      type: normalizeFieldType(existing.type)
    };
  }

  const planned = plannedFields.find((field) => field.slug === "migration_meta");
  return {
    slug: planned?.slug ?? "migration_meta",
    type: planned?.type ?? "json"
  };
}

function normalizeFieldType(type?: string): CollectionFieldSpec["type"] {
  if (type === "string" || type === "text" || type === "json" || type === "datetime" || type === "portableText") {
    return type;
  }
  return "portableText";
}

function normalizeAnyFieldType(type?: string): EmDashFieldType {
  switch (type) {
    case "string":
    case "text":
    case "number":
    case "integer":
    case "boolean":
    case "datetime":
    case "select":
    case "multiSelect":
    case "portableText":
    case "image":
    case "file":
    case "reference":
    case "json":
    case "slug":
      return type;
    default:
      return "portableText";
  }
}

function resolvePrimaryMediaId(
  sourceItem: WordPressSourceBundle["contentItems"][number],
  mediaSourceIdToMediaId: Map<string, string>,
  _mediaSourceUrlToMediaId: Map<string, string>
): string | undefined {
  if (sourceItem.featuredMediaId) {
    const featuredMediaId = mediaSourceIdToMediaId.get(sourceItem.featuredMediaId);
    if (featuredMediaId) {
      return featuredMediaId;
    }
  }

  return undefined;
}

function resolvePrimaryMediaUrl(
  sourceItem: WordPressSourceBundle["contentItems"][number],
  _mediaSourceIdToMediaId: Map<string, string>,
  _mediaSourceUrlToMediaId: Map<string, string>,
  bundle: WordPressSourceBundle
): string | undefined {
  if (sourceItem.featuredMediaId) {
    const media = bundle.media.find((item) => item.id === sourceItem.featuredMediaId);
    if (media?.sourceUrl) {
      return media.sourceUrl;
    }
  }
  return undefined;
}

function resolveAuthorName(
  bundle: WordPressSourceBundle,
  authorId: string | undefined
): string | undefined {
  if (!authorId) {
    return undefined;
  }
  return bundle.authors.find((author) => author.id === authorId)?.displayName;
}

function buildEntryData(params: {
  entry: ImportPlan["entriesToCreate"][number];
  sourceItem: WordPressSourceBundle["contentItems"][number];
  rewrittenContent: StructuredNode[];
  portableTextConversion: ReturnType<typeof convertStructuredNodesToPortableText>;
  migrationMeta: Record<string, unknown>;
  collectionContext?: CollectionImportContext;
  contentField: CollectionImportContext["contentField"];
  metadataField: CollectionImportContext["metadataField"];
  primaryMediaId?: string;
  primaryMediaUrl?: string;
  authorName?: string;
  taxonomyTerms: Array<{ taxonomy: string; slug: string; name: string; emdashTermId: string | null }>;
}): Record<string, unknown> {
  const {
    entry,
    sourceItem,
    rewrittenContent,
    portableTextConversion,
    migrationMeta,
    collectionContext,
    contentField,
    metadataField,
    primaryMediaId,
    primaryMediaUrl,
    authorName,
    taxonomyTerms
  } = params;

  const fullData: Record<string, unknown> = {
    title: entry.title,
    ...buildContentFieldPayload(contentField, portableTextConversion, rewrittenContent, sourceItem),
    [metadataField.slug]: buildFieldValue(
      metadataField,
      {
        entry,
        sourceItem,
        rewrittenContent,
        portableTextConversion,
        migrationMeta,
        summaryText: summarizeSourceText(sourceItem, rewrittenContent),
        excerptText: resolveExcerptText(sourceItem, rewrittenContent),
        sourceUrl: sourceItem.sourceUrl,
        publishedAt: sourceItem.publishedAt,
        primaryMediaId,
        primaryMediaUrl,
        authorName,
        taxonomyTerms
      }
    )
  };

  const fieldsBySlug = collectionContext?.fieldsBySlug ?? new Map<string, EmDashFieldRecord>();
  for (const field of fieldsBySlug.values()) {
    if (field.slug in fullData) {
      continue;
    }

    const value = buildFieldValue(field, {
      entry,
      sourceItem,
      rewrittenContent,
      portableTextConversion,
      migrationMeta,
      summaryText: summarizeSourceText(sourceItem, rewrittenContent),
      excerptText: resolveExcerptText(sourceItem, rewrittenContent),
      sourceUrl: sourceItem.sourceUrl,
      publishedAt: sourceItem.publishedAt,
      primaryMediaId,
      primaryMediaUrl,
      authorName,
      taxonomyTerms
    });

    if (value !== undefined) {
      fullData[field.slug] = value;
    }
  }

  return fullData;
}

function buildCreateEntryData(
  fullEntryData: Record<string, unknown>,
  collectionContext: CollectionImportContext | undefined,
  contentField: CollectionImportContext["contentField"]
): Record<string, unknown> {
  const createData: Record<string, unknown> = {};
  const fieldsBySlug = collectionContext?.fieldsBySlug ?? new Map<string, EmDashFieldRecord>();

  if ("title" in fullEntryData) {
    createData.title = fullEntryData.title;
  }

  const contentValue = fullEntryData[contentField.slug];
  const contentFieldRecord = fieldsBySlug.get(contentField.slug);
  if (contentValue !== undefined && contentFieldRecord?.required) {
    createData[contentField.slug] = contentValue;
  }

  for (const field of fieldsBySlug.values()) {
    if (field.slug === "title" || field.slug === contentField.slug) {
      continue;
    }
    if (!field.required) {
      continue;
    }
    if (field.defaultValue !== null && field.defaultValue !== undefined) {
      continue;
    }
    if (fullEntryData[field.slug] !== undefined) {
      createData[field.slug] = fullEntryData[field.slug];
    }
  }

  return createData;
}

function buildFieldValue(
  field: Pick<EmDashFieldRecord, "slug" | "type" | "defaultValue" | "required" | "validation" | "options">,
  context: {
    entry: ImportPlan["entriesToCreate"][number];
    sourceItem: WordPressSourceBundle["contentItems"][number];
    rewrittenContent: StructuredNode[];
    portableTextConversion: ReturnType<typeof convertStructuredNodesToPortableText>;
    migrationMeta: Record<string, unknown>;
    summaryText: string;
    excerptText: string;
    sourceUrl?: string;
    publishedAt?: string;
    primaryMediaId?: string;
    primaryMediaUrl?: string;
    authorName?: string;
    taxonomyTerms: Array<{ taxonomy: string; slug: string; name: string; emdashTermId: string | null }>;
  }
): unknown {
  if (field.defaultValue !== null && field.defaultValue !== undefined) {
    return field.defaultValue;
  }

  const slug = field.slug.trim();
  const slugLower = slug.toLowerCase();
  const fieldType = normalizeAnyFieldType(field.type);

  if (slugLower === "title" || slugLower === "name" || slugLower === "headline") {
    return context.entry.title;
  }

  if (isContentFieldSlug(slugLower)) {
    return buildContentValueForType(fieldType, context);
  }

  if (slugLower === "migration_meta") {
    return context.migrationMeta;
  }

  if (isExcerptFieldSlug(slugLower)) {
    return buildTextualValue(fieldType, context.excerptText, context);
  }

  if (isSourceUrlFieldSlug(slugLower) && context.sourceUrl) {
    return buildStringLikeValue(fieldType, context.sourceUrl);
  }

  if (isPublishedAtFieldSlug(slugLower) && context.publishedAt) {
    return buildDateLikeValue(fieldType, context.publishedAt);
  }

  if (isAuthorFieldSlug(slugLower) && context.authorName) {
    return buildStringLikeValue(fieldType, context.authorName);
  }

  if (isTaxonomyListFieldSlug(slugLower)) {
    const values = context.taxonomyTerms
      .filter((term) => slugLower.includes("tag") ? term.taxonomy === "tags" : slugLower.includes("categor") ? term.taxonomy === "categories" : true)
      .map((term) => term.name || term.slug)
      .filter(Boolean);
    if (values.length > 0) {
      return buildListLikeValue(fieldType, values, field);
    }
  }

  if (isMediaFieldSlug(slugLower)) {
    const mediaValue = buildMediaFieldValue(fieldType, context.primaryMediaId, context.primaryMediaUrl);
    if (mediaValue !== undefined) {
      return mediaValue;
    }
  }

  if (!field.required) {
    return undefined;
  }

  return buildRequiredFallbackValue(fieldType, field, context);
}

function buildContentValueForType(
  fieldType: EmDashFieldType,
  context: {
    sourceItem: WordPressSourceBundle["contentItems"][number];
    rewrittenContent: StructuredNode[];
    portableTextConversion: ReturnType<typeof convertStructuredNodesToPortableText>;
    summaryText: string;
  }
): unknown {
  switch (fieldType) {
    case "json":
      return context.rewrittenContent;
    case "text":
    case "string":
    case "slug":
      return context.sourceItem.rawContent?.trim() || serializeStructuredNodesToText(context.rewrittenContent);
    case "portableText":
      return context.portableTextConversion.portableText.length > 0
        ? context.portableTextConversion.portableText
        : [createPortableTextFallbackBlock(context.summaryText)];
    default:
      return context.portableTextConversion.portableText.length > 0
        ? context.portableTextConversion.portableText
        : [createPortableTextFallbackBlock(context.summaryText)];
  }
}

function buildRequiredFallbackValue(
  fieldType: EmDashFieldType,
  field: Pick<EmDashFieldRecord, "slug" | "validation" | "options">,
  context: {
    entry: ImportPlan["entriesToCreate"][number];
    summaryText: string;
    excerptText: string;
    sourceUrl?: string;
    publishedAt?: string;
    primaryMediaId?: string;
    primaryMediaUrl?: string;
  }
): unknown {
  switch (fieldType) {
    case "portableText":
      return [createPortableTextFallbackBlock(context.summaryText)];
    case "json":
      return {};
    case "boolean":
      return false;
    case "number":
    case "integer":
      return 0;
    case "datetime":
      return context.publishedAt ?? new Date().toISOString();
    case "slug":
      return context.entry.slug;
    case "select":
      return resolveFieldOptions(field)[0] ?? context.entry.title;
    case "multiSelect":
      return [];
    case "image":
    case "file":
    case "reference":
      return buildMediaFieldValue(fieldType, context.primaryMediaId, context.primaryMediaUrl);
    case "text":
    case "string":
    default:
      return context.excerptText || context.summaryText || context.entry.title || context.sourceUrl || " ";
  }
}

function buildTextualValue(
  fieldType: EmDashFieldType,
  text: string,
  context: {
    portableTextConversion: ReturnType<typeof convertStructuredNodesToPortableText>;
    rewrittenContent: StructuredNode[];
  }
): unknown {
  switch (fieldType) {
    case "portableText":
      return context.portableTextConversion.portableText.length > 0
        ? context.portableTextConversion.portableText
        : [createPortableTextFallbackBlock(text)];
    case "json":
      return context.rewrittenContent;
    case "text":
    case "string":
    case "slug":
    default:
      return text;
  }
}

function buildStringLikeValue(fieldType: EmDashFieldType, value: string): unknown {
  switch (fieldType) {
    case "portableText":
      return [createPortableTextFallbackBlock(value)];
    case "json":
      return { value };
    case "text":
    case "string":
    case "slug":
    case "select":
    default:
      return value;
  }
}

function buildDateLikeValue(fieldType: EmDashFieldType, value: string): unknown {
  switch (fieldType) {
    case "datetime":
    case "string":
    case "text":
      return value;
    case "portableText":
      return [createPortableTextFallbackBlock(value)];
    case "json":
      return { value };
    default:
      return value;
  }
}

function buildListLikeValue(
  fieldType: EmDashFieldType,
  values: string[],
  field: Pick<EmDashFieldRecord, "slug" | "validation" | "options">
): unknown {
  switch (fieldType) {
    case "multiSelect":
      return values;
    case "select":
      return values[0] ?? resolveFieldOptions(field)[0];
    case "json":
      return values;
    case "portableText":
      return values.map((value, index) =>
        createPortableTextFallbackBlock(value, { listItem: "bullet", level: 1, suffix: `${index}` })
      );
    case "text":
    case "string":
    default:
      return values.join(", ");
  }
}

function buildMediaFieldValue(
  fieldType: EmDashFieldType,
  primaryMediaId?: string,
  primaryMediaUrl?: string
): unknown {
  switch (fieldType) {
    case "image":
    case "file":
    case "reference":
      return primaryMediaId;
    case "json":
      return primaryMediaId ? { mediaId: primaryMediaId, sourceUrl: primaryMediaUrl ?? null } : undefined;
    case "portableText":
      return primaryMediaUrl ? [createPortableTextFallbackBlock(primaryMediaUrl)] : undefined;
    case "text":
    case "string":
    default:
      return primaryMediaUrl ?? primaryMediaId;
  }
}

function summarizeSourceText(
  sourceItem: WordPressSourceBundle["contentItems"][number],
  rewrittenContent: StructuredNode[]
): string {
  return (
    resolveExcerptText(sourceItem, rewrittenContent) ||
    sourceItem.rawContent?.trim() ||
    serializeStructuredNodesToText(rewrittenContent) ||
    sourceItem.title ||
    "Imported content"
  );
}

function resolveExcerptText(
  sourceItem: WordPressSourceBundle["contentItems"][number],
  rewrittenContent: StructuredNode[]
): string {
  return sourceItem.excerpt?.trim() || takeTextSnippet(serializeStructuredNodesToText(rewrittenContent), 280);
}

function takeTextSnippet(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}

function resolveFieldOptions(
  field: Pick<EmDashFieldRecord, "validation" | "options">
): string[] {
  const validationOptions =
    field.validation &&
    typeof field.validation === "object" &&
    Array.isArray(field.validation.options)
      ? field.validation.options
      : [];
  const widgetOptions =
    field.options &&
    typeof field.options === "object" &&
    Array.isArray(field.options.options)
      ? field.options.options
      : [];

  return [...validationOptions, ...widgetOptions].filter(
    (value): value is string => typeof value === "string" && value.length > 0
  );
}

function isContentFieldSlug(slug: string): boolean {
  return ["body", "content", "migration_content", "post_content", "article_content"].includes(slug);
}

function isExcerptFieldSlug(slug: string): boolean {
  return ["excerpt", "summary", "description", "dek", "standfirst", "lead"].includes(slug);
}

function isSourceUrlFieldSlug(slug: string): boolean {
  return ["migration_source_url", "source_url", "sourceurl", "canonical_url", "url", "original_url"].includes(slug);
}

function isPublishedAtFieldSlug(slug: string): boolean {
  return ["migration_published_at", "published_at", "publishedat", "publish_date", "date"].includes(slug);
}

function isMediaFieldSlug(slug: string): boolean {
  return ["image", "featured_image", "featuredimage", "hero_image", "heroimage", "cover_image", "coverimage", "thumbnail", "featured_media"].includes(slug);
}

function isAuthorFieldSlug(slug: string): boolean {
  return ["author", "author_name", "authorname", "byline"].includes(slug);
}

function isTaxonomyListFieldSlug(slug: string): boolean {
  return ["categories", "category_names", "category", "tags", "tag_names", "tag"].includes(slug);
}

function areRecordValuesEqual(left: Record<string, unknown>, right: Record<string, unknown>): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function createPortableTextFallbackBlock(
  text: string,
  options?: { listItem?: "bullet" | "number"; level?: number; suffix?: string }
): { _type: "block"; _key: string; style: "normal"; markDefs: []; children: Array<{ _type: "span"; _key: string; marks: []; text: string }>; listItem?: "bullet" | "number"; level?: number } {
  const normalizedText = text.trim().length ? text : " ";
  const suffix = options?.suffix ? `-${options.suffix}` : "";
  return {
    _type: "block",
    _key: `fallback-block${suffix}`,
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        _key: `fallback-span${suffix}`,
        marks: [],
        text: normalizedText
      }
    ],
    ...(options?.listItem ? { listItem: options.listItem } : {}),
    ...(options?.level ? { level: options.level } : {})
  };
}

function buildCreateFailureMessage(
  error: unknown,
  collectionContext: CollectionImportContext | undefined,
  contentField: CollectionImportContext["contentField"],
  fullEntryData: Record<string, unknown>
): string {
  const baseMessage = asErrorMessage(error);
  const requiredFields = Array.from(collectionContext?.fieldsBySlug.values() ?? [])
    .filter((field) => field.required)
    .map((field) => `${field.slug}:${normalizeAnyFieldType(field.type)}`);
  const payloadKeys = Object.keys(fullEntryData).sort();
  return `${baseMessage}. Content field: ${contentField.slug}:${contentField.type}. Payload keys: ${payloadKeys.join(", ")}. Required fields seen on target: ${requiredFields.join(", ") || "none"}.`;
}

function buildUpdateFailureMessage(
  error: unknown,
  collectionContext: CollectionImportContext | undefined,
  fullEntryData: Record<string, unknown>
): string {
  const fieldTypes = Array.from(collectionContext?.fieldsBySlug.values() ?? [])
    .map((field) => `${field.slug}:${normalizeAnyFieldType(field.type)}`)
    .join(", ");
  return `${asErrorMessage(error)}. Update payload keys: ${Object.keys(fullEntryData).sort().join(", ")}. Target fields: ${fieldTypes || "unknown"}.`;
}

function buildContentFieldPayload(
  contentField: CollectionImportContext["contentField"],
  portableTextConversion: ReturnType<typeof convertStructuredNodesToPortableText>,
  rewrittenContent: StructuredNode[],
  sourceItem: WordPressSourceBundle["contentItems"][number]
): Record<string, unknown> {
  switch (contentField.type) {
    case "json":
      return {
        [contentField.slug]: rewrittenContent
      };
    case "text":
    case "string":
      return {
        [contentField.slug]: sourceItem.rawContent?.trim() || serializeStructuredNodesToText(rewrittenContent)
      };
    case "portableText":
    default:
      return {
        [contentField.slug]:
          portableTextConversion.portableText.length > 0
            ? portableTextConversion.portableText
            : [{ _type: "block", _key: "empty-body", style: "normal", markDefs: [], children: [{ _type: "span", _key: "empty-body-span", marks: [], text: sourceItem.rawContent?.trim() || " " }] }]
      };
  }
}

function serializeStructuredNodesToText(nodes: StructuredNode[]): string {
  return nodes
    .map((node) => {
      switch (node.kind) {
        case "paragraph":
        case "quote":
          return node.text;
        case "heading":
          return node.text;
        case "list":
          return node.items.join("\n");
        case "code":
          return node.code;
        case "html":
          return node.rawHtml;
        case "image":
          return [node.alt, node.caption, node.url].filter(Boolean).join(" - ");
        case "gallery":
          return node.images.map((image) => [image.alt, image.url].filter(Boolean).join(" - ")).join("\n");
        case "embed":
          return [node.provider, node.url, node.html].filter(Boolean).join(" - ");
        case "table":
          return node.rows.map((row) => row.join(" | ")).join("\n");
        case "fallback":
          return `[Unsupported block: ${node.label}] ${node.rawPayload}`;
        case "separator":
          return "---";
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

function mapWordPressTaxonomyName(taxonomy: string): string {
  const normalized = taxonomy.trim().toLowerCase();
  if (normalized === "category") {
    return "categories";
  }
  if (normalized === "post_tag") {
    return "tags";
  }
  return normalized.replace(/[^a-z0-9_]+/g, "_");
}

function mapWordPressStatusToEmDashStatus(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === "publish" || normalized === "published") {
    return "published";
  }

  if (normalized === "future" || normalized === "scheduled") {
    return "draft";
  }

  return "draft";
}

function buildImportSummaryNote(result: ImportExecutionResult): string {
  const importedEntries = result.entries.filter(
    (entry) => entry.status === "imported"
  ).length;
  const skippedEntries = result.entries.filter(
    (entry) => entry.status === "skipped"
  ).length;
  const failed = result.failures.length;

  return `Imported ${importedEntries} entry(ies), ${result.media.length} media item(s), synced ${result.taxonomies.length} taxonomy definition(s), synced ${result.terms.length} term(s), created ${result.collections.filter((item) => item.created).length} collection(s), and created ${result.fields.filter((item) => item.created).length} field(s). Skipped ${skippedEntries} entry(ies); ${failed} failure(s) were recorded.`;
}

function asErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown EmDash import error.";
}

function humanizeLabel(slug: string): string {
  return slug
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function humanizeSingularLabel(slug: string): string {
  return humanizeLabel(slug.endsWith("s") ? slug.slice(0, -1) : slug);
}
