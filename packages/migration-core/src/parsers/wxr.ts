import { XMLParser } from "fast-xml-parser";

import type {
  CustomPostTypeFinding,
  MediaAsset,
  TaxonomyTerm,
  WordPressAuthor,
  WordPressContentItem,
  WordPressSourceBundle
} from "@wp2emdash/shared-types";

import { ensureArray, uniqueBy } from "../utils/collections.js";

interface RawXmlNode {
  __cdata?: string;
  "#text"?: string;
}

interface WxrRoot {
  rss?: {
    channel?: Record<string, unknown>;
  };
}

const BUILT_IN_CONTENT_TYPES = new Set(["post", "page"]);

function readText(input: unknown): string {
  if (typeof input === "string") {
    return input.trim();
  }

  if (typeof input === "number") {
    return String(input);
  }

  if (typeof input === "object" && input !== null) {
    const node = input as RawXmlNode;
    return (node.__cdata ?? node["#text"] ?? "").trim();
  }

  return "";
}

function mapAuthor(rawAuthor: unknown): WordPressAuthor {
  const author = rawAuthor as Record<string, unknown>;

  return {
    id: readText(author["wp:author_id"]) || readText(author["wp:author_login"]),
    login: readText(author["wp:author_login"]),
    email: readText(author["wp:author_email"]) || undefined,
    displayName: readText(author["wp:author_display_name"]) || readText(author["wp:author_login"])
  };
}

function mapTerm(rawTerm: unknown): TaxonomyTerm {
  const term = rawTerm as Record<string, unknown>;

  return {
    id: readText(term["wp:term_id"]) || readText(term["wp:term_slug"]),
    taxonomy: readText(term["wp:term_taxonomy"]) || "category",
    slug: readText(term["wp:term_slug"]),
    name: readText(term["wp:term_name"]),
    description: readText(term["wp:term_description"]) || undefined,
    parentId: readText(term["wp:term_parent"]) || undefined
  };
}

function extractAttachmentAlt(rawItem: Record<string, unknown>): string | undefined {
  const metadata = ensureArray(rawItem["wp:postmeta"]);
  const altNode = metadata.find((entry) => {
    const meta = entry as Record<string, unknown>;
    return readText(meta["wp:meta_key"]) === "_wp_attachment_image_alt";
  }) as Record<string, unknown> | undefined;

  return altNode ? readText(altNode["wp:meta_value"]) || undefined : undefined;
}

export function parseWxrXml(xml: string): WordPressSourceBundle {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    trimValues: false,
    cdataPropName: "__cdata"
  });

  const root = parser.parse(xml) as WxrRoot;
  const channel = root.rss?.channel;

  if (!channel) {
    throw new Error("Invalid WXR file: missing rss.channel");
  }

  const authors = uniqueBy(ensureArray(channel["wp:author"]).map(mapAuthor), (author) => author.id);
  const terms = uniqueBy(ensureArray(channel["wp:term"]).map(mapTerm), (term) => `${term.taxonomy}:${term.slug}`);
  const termIdByTaxonomyAndSlug = new Map(terms.map((term) => [`${term.taxonomy}:${term.slug}`, term.id]));
  const authorIdByLogin = new Map(authors.map((author) => [author.login, author.id]));
  const items = ensureArray(channel.item).map((item) => item as Record<string, unknown>);

  const contentItems: WordPressContentItem[] = [];
  const media: MediaAsset[] = [];

  for (const item of items) {
    const type = readText(item["wp:post_type"]) || "post";
    const id = readText(item["wp:post_id"]) || readText(item.guid) || readText(item.title);
    const authorLogin = readText(item["dc:creator"]);
    const taxonomyTermIds = ensureArray(item.category)
      .map((categoryNode) => {
        const category = categoryNode as Record<string, unknown>;
        const taxonomy = readText(category.domain) || "category";
        const slug = readText(category.nicename);
        return termIdByTaxonomyAndSlug.get(`${taxonomy}:${slug}`);
      })
      .filter((value): value is string => Boolean(value));

    if (type === "attachment") {
      media.push({
        id,
        slug: readText(item["wp:post_name"]) || id,
        title: readText(item.title) || readText(item["wp:post_name"]) || "Untitled attachment",
        sourceUrl: readText(item["wp:attachment_url"]) || readText(item.link),
        altText: extractAttachmentAlt(item),
        authorId: authorIdByLogin.get(authorLogin)
      });
      continue;
    }

    contentItems.push({
      id,
      type,
      slug: readText(item["wp:post_name"]) || id,
      title: readText(item.title) || "Untitled",
      excerpt: readText(item["excerpt:encoded"]) || undefined,
      rawContent: readText(item["content:encoded"]),
      status: readText(item["wp:status"]) || "draft",
      publishedAt: readText(item["wp:post_date_gmt"]) || undefined,
      modifiedAt: readText(item["wp:post_modified_gmt"]) || undefined,
      authorId: authorIdByLogin.get(authorLogin),
      sourceUrl: readText(item.link) || undefined,
      featuredMediaId: undefined,
      taxonomyTermIds
    });
  }

  const customPostTypes = Array.from(
    contentItems.reduce<Map<string, CustomPostTypeFinding>>((accumulator, item) => {
      if (BUILT_IN_CONTENT_TYPES.has(item.type)) {
        return accumulator;
      }

      const current = accumulator.get(item.type);
      accumulator.set(item.type, {
        slug: item.type,
        label: item.type,
        itemCount: (current?.itemCount ?? 0) + 1
      });
      return accumulator;
    }, new Map()).values()
  );

  return {
    site: {
      name: readText(channel.title) || "WordPress Site",
      url: readText(channel["wp:base_site_url"]) || readText(channel.link),
      description: readText(channel.description) || undefined,
      exportedAt: undefined,
      generator: readText(channel["wp:wxr_version"]) || undefined,
      sourceKind: "wxr"
    },
    authors,
    taxonomyTerms: terms,
    media,
    contentItems,
    customPostTypes: customPostTypes.sort((left, right) => left.slug.localeCompare(right.slug))
  };
}
