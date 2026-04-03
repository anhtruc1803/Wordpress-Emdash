import type {
  ImportExecutionResult,
  ImportFailure,
  ImportPlan,
  StructuredNode,
  TaxonomyTerm,
  WordPressSourceBundle
} from "@wp2emdash/shared-types";

import {
  EmDashApiClient,
  type EmDashTargetRequest
} from "./emdash-api.js";
import { convertStructuredNodesToPortableText } from "./portable-text.js";

interface CollectionFieldSpec {
  slug: string;
  label: string;
  type: "string" | "text" | "json" | "datetime" | "portableText";
  required?: boolean;
  searchable?: boolean;
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

      for (const field of fields) {
        const existingField = fieldTypesBySlug.get(field.slug);
        if (existingField) {
          result.fields.push({ collection, field: field.slug, created: false });
          continue;
        }

        await createFieldWithPortableTextFallback(client, collection, field);
        result.fields.push({ collection, field: field.slug, created: true });
      }
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

      try {
        const created = await client.createContent(entry.targetCollection, {
          slug: entry.slug,
          status: mapWordPressStatusToEmDashStatus(entry.status),
          data: {
            title: entry.title,
            migration_content: portableTextConversion.portableText,
            ...(sourceItem.excerpt ? { migration_excerpt: sourceItem.excerpt } : {}),
            ...(sourceItem.sourceUrl ? { migration_source_url: sourceItem.sourceUrl } : {}),
            ...(sourceItem.publishedAt
              ? { migration_published_at: sourceItem.publishedAt }
              : {}),
            migration_meta: migrationMeta
          }
        });

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
          message: asErrorMessage(error)
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
        slug: "migration_content",
        label: "Migration content",
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
