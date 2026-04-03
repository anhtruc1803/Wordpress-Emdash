import { z } from "zod";

import type {
  CustomPostTypeFinding,
  MediaAsset,
  TaxonomyTerm,
  WordPressAuthor,
  WordPressContentItem,
  WordPressSourceBundle
} from "@wp2emdash/shared-types";

const renderedFieldSchema = z.object({
  rendered: z.string().default("")
});

const restPostSchema = z.object({
  id: z.number(),
  slug: z.string(),
  date_gmt: z.string().optional(),
  modified_gmt: z.string().optional(),
  status: z.string().default("draft"),
  link: z.string().optional(),
  author: z.number().optional(),
  featured_media: z.number().optional(),
  categories: z.array(z.number()).optional(),
  tags: z.array(z.number()).optional(),
  title: renderedFieldSchema.default({ rendered: "" }),
  excerpt: renderedFieldSchema.default({ rendered: "" }),
  content: renderedFieldSchema.default({ rendered: "" })
});

const restMediaSchema = z.object({
  id: z.number(),
  slug: z.string(),
  source_url: z.string(),
  mime_type: z.string().optional(),
  alt_text: z.string().optional(),
  author: z.number().optional(),
  title: renderedFieldSchema.default({ rendered: "" }),
  caption: renderedFieldSchema.default({ rendered: "" }),
  description: renderedFieldSchema.default({ rendered: "" })
});

const restTermSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  parent: z.number().optional()
});

const restUserSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string()
});

const restTypeSchema = z.object({
  slug: z.string(),
  name: z.string(),
  rest_base: z.string().optional(),
  viewable: z.boolean().optional()
});

const restRootSchema = z.object({
  name: z.string().default("WordPress REST Site"),
  description: z.string().optional(),
  url: z.string().optional(),
  home: z.string().optional()
});

export interface RestApiPayload {
  root: unknown;
  types: unknown;
  posts: unknown;
  pages: unknown;
  categories: unknown;
  tags: unknown;
  media: unknown;
  users: unknown;
  [key: string]: unknown;
}

const BUILT_IN_REST_TYPES = new Set(["post", "page", "attachment"]);

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function normalizeBaseWpJsonUrl(input: string): string {
  const normalized = stripTrailingSlash(input);
  return normalized.endsWith("/wp-json") ? normalized : `${normalized}/wp-json`;
}

async function fetchJson(url: string): Promise<{ headers: Headers; data: unknown }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return {
    headers: response.headers,
    data: await response.json()
  };
}

async function fetchPaginatedCollection(baseWpJsonUrl: string, endpoint: string): Promise<unknown[]> {
  const items: unknown[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = new URL(`${stripTrailingSlash(baseWpJsonUrl)}/${endpoint}`);
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", String(page));

    const response = await fetchJson(url.toString());
    const pageItems = z.array(z.unknown()).parse(response.data);
    items.push(...pageItems);
    totalPages = Number(response.headers.get("x-wp-totalpages") ?? "1");
    page += 1;
  } while (page <= totalPages);

  return items;
}

function mapAuthors(users: z.infer<typeof restUserSchema>[]): WordPressAuthor[] {
  return users.map((user) => ({
    id: String(user.id),
    login: user.slug,
    displayName: user.name
  }));
}

function mapTerms(terms: z.infer<typeof restTermSchema>[], taxonomy: string): TaxonomyTerm[] {
  return terms.map((term) => ({
    id: String(term.id),
    taxonomy,
    slug: term.slug,
    name: term.name,
    description: term.description || undefined,
    parentId: term.parent ? String(term.parent) : undefined
  }));
}

function mapMedia(items: z.infer<typeof restMediaSchema>[]): MediaAsset[] {
  return items.map((item) => ({
    id: String(item.id),
    slug: item.slug,
    title: item.title.rendered || item.slug,
    sourceUrl: item.source_url,
    mimeType: item.mime_type,
    altText: item.alt_text || undefined,
    caption: item.caption.rendered || undefined,
    description: item.description.rendered || undefined,
    authorId: item.author ? String(item.author) : undefined
  }));
}

function mapContentItems(items: z.infer<typeof restPostSchema>[], type: string): WordPressContentItem[] {
  return items.map((item) => ({
    id: String(item.id),
    type,
    slug: item.slug,
    title: item.title.rendered || item.slug,
    excerpt: item.excerpt.rendered || undefined,
    rawContent: item.content.rendered,
    status: item.status,
    publishedAt: item.date_gmt,
    modifiedAt: item.modified_gmt,
    authorId: item.author ? String(item.author) : undefined,
    sourceUrl: item.link,
    featuredMediaId: item.featured_media && item.featured_media > 0 ? String(item.featured_media) : undefined,
    taxonomyTermIds: [
      ...(item.categories?.map(String) ?? []),
      ...(item.tags?.map(String) ?? [])
    ]
  }));
}

function mapCustomPostTypes(typeMap: Record<string, z.infer<typeof restTypeSchema>>, contentItems: WordPressContentItem[]): CustomPostTypeFinding[] {
  const counts = new Map<string, number>();

  for (const item of contentItems) {
    if (BUILT_IN_REST_TYPES.has(item.type)) {
      continue;
    }

    counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([slug, itemCount]) => ({
    slug,
    label: typeMap[slug]?.name ?? slug,
    itemCount
  }));
}

export function normalizeRestApiBundle(payload: RestApiPayload, baseUrl?: string): WordPressSourceBundle {
  const root = restRootSchema.parse(payload.root);
  const typeMap = z.record(z.string(), restTypeSchema).parse(payload.types);
  const posts = z.array(restPostSchema).parse(payload.posts);
  const pages = z.array(restPostSchema).parse(payload.pages);
  const categories = z.array(restTermSchema).parse(payload.categories);
  const tags = z.array(restTermSchema).parse(payload.tags);
  const mediaItems = z.array(restMediaSchema).parse(payload.media);
  const users = z.array(restUserSchema).parse(payload.users);

  const customTypeItems: WordPressContentItem[] = [];
  for (const [slug, type] of Object.entries(typeMap)) {
    if (BUILT_IN_REST_TYPES.has(slug) || !type.viewable) {
      continue;
    }

    const collection = payload[type.rest_base ?? `${slug}s`];
    if (!collection) {
      continue;
    }

    customTypeItems.push(...mapContentItems(z.array(restPostSchema).parse(collection), slug));
  }

  const contentItems = [...mapContentItems(posts, "post"), ...mapContentItems(pages, "page"), ...customTypeItems];

  return {
    site: {
      name: root.name,
      description: root.description || undefined,
      url: root.url ?? root.home ?? baseUrl ?? "",
      sourceKind: "api"
    },
    authors: mapAuthors(users),
    taxonomyTerms: [...mapTerms(categories, "category"), ...mapTerms(tags, "post_tag")],
    media: mapMedia(mediaItems),
    contentItems,
    customPostTypes: mapCustomPostTypes(typeMap, contentItems)
  };
}

export async function loadWordPressRestApi(baseWpJsonUrl: string): Promise<WordPressSourceBundle> {
  const normalizedBaseUrl = normalizeBaseWpJsonUrl(baseWpJsonUrl);
  const root = await fetchJson(normalizedBaseUrl);
  const types = await fetchJson(`${normalizedBaseUrl}/wp/v2/types`);
  const typeMap = z.record(z.string(), restTypeSchema).parse(types.data);

  const posts = await fetchPaginatedCollection(normalizedBaseUrl, "wp/v2/posts");
  const pages = await fetchPaginatedCollection(normalizedBaseUrl, "wp/v2/pages");
  const categories = await fetchPaginatedCollection(normalizedBaseUrl, "wp/v2/categories");
  const tags = await fetchPaginatedCollection(normalizedBaseUrl, "wp/v2/tags");
  const media = await fetchPaginatedCollection(normalizedBaseUrl, "wp/v2/media");
  const users = await fetchPaginatedCollection(normalizedBaseUrl, "wp/v2/users");

  const payload: RestApiPayload = {
    root: root.data,
    types: typeMap,
    posts,
    pages,
    categories,
    tags,
    media,
    users
  };

  for (const [slug, type] of Object.entries(typeMap)) {
    if (BUILT_IN_REST_TYPES.has(slug) || !type.viewable || !type.rest_base) {
      continue;
    }

    payload[type.rest_base] = await fetchPaginatedCollection(normalizedBaseUrl, `wp/v2/${type.rest_base}`);
  }

  return normalizeRestApiBundle(payload, normalizedBaseUrl);
}
