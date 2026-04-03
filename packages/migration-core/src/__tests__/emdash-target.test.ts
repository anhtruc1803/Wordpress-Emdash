import { afterEach, describe, expect, it, vi } from "vitest";

import type { ImportPlan, WordPressSourceBundle } from "@wp2emdash/shared-types";

import {
  LiveEmDashTargetAdapter,
  PlanningOnlyEmDashTargetAdapter
} from "../adapters/emdash-target.js";
import { testEmDashConnection } from "../adapters/emdash-api.js";

const bundle: WordPressSourceBundle = {
  site: {
    name: "Example WP Site",
    url: "https://source.test",
    sourceKind: "wxr"
  },
  authors: [],
  taxonomyTerms: [
    {
      id: "term-cat-1",
      taxonomy: "category",
      slug: "news",
      name: "News"
    },
    {
      id: "term-tag-1",
      taxonomy: "post_tag",
      slug: "launch",
      name: "Launch"
    }
  ],
  media: [
    {
      id: "media-1",
      slug: "hero-image",
      title: "Hero image",
      sourceUrl: "https://source.test/image.jpg",
      mimeType: "image/jpeg"
    }
  ],
  contentItems: [
    {
      id: "post-1",
      type: "post",
      slug: "hello-world",
      title: "Hello World",
      excerpt: "Excerpt",
      rawContent: "",
      status: "publish",
      publishedAt: "2026-04-03T03:00:00.000Z",
      sourceUrl: "https://source.test/hello-world",
      taxonomyTermIds: ["term-cat-1", "term-tag-1"]
    }
  ],
  customPostTypes: []
};

const plan: ImportPlan = {
  generatedAt: "2026-04-03T03:00:00.000Z",
  target: "https://emdash.example",
  collections: [
    {
      sourceType: "post",
      targetCollection: "posts",
      count: 1
    }
  ],
  entriesToCreate: [
    {
      sourceId: "post-1",
      sourceType: "post",
      targetCollection: "posts",
      slug: "hello-world",
      title: "Hello World",
      status: "publish",
      content: [
        {
          kind: "heading",
          level: 2,
          text: "Hello"
        },
        {
          kind: "paragraph",
          text: "World"
        },
        {
          kind: "image",
          url: "https://source.test/image.jpg",
          alt: "Hero"
        }
      ],
      taxonomyTermIds: ["term-cat-1", "term-tag-1"],
      warnings: []
    }
  ],
  mediaToImport: [
    {
      sourceId: "media-1",
      url: "https://source.test/image.jpg",
      filename: "image.jpg",
      mimeType: "image/jpeg",
      altText: "Hero"
    }
  ],
  rewriteSuggestions: [],
  unresolvedItems: [],
  manualFixes: []
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("PlanningOnlyEmDashTargetAdapter", () => {
  it("returns a planned result when no token is configured", async () => {
    const adapter = new PlanningOnlyEmDashTargetAdapter();
    const result = await adapter.execute(plan, bundle, {
      url: "https://emdash.example"
    });

    expect(result.mode).toBe("planned");
    expect(result.note).toContain("Configure an EmDash API token");
    expect(result.taxonomies).toEqual([]);
    expect(result.terms).toEqual([]);
  });
});

describe("testEmDashConnection", () => {
  it("checks schema and taxonomy access", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url === "https://emdash.example/_emdash/api/schema/collections") {
        return jsonResponse({ items: [] });
      }

      if (url === "https://emdash.example/_emdash/api/taxonomies") {
        return jsonResponse({ taxonomies: [] });
      }

      throw new Error(`Unexpected fetch call: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await testEmDashConnection({
      url: "https://emdash.example",
      apiToken: "ec_pat_test"
    });

    expect(result.ok).toBe(true);
    expect(result.checks).toHaveLength(2);
  });
});

describe("LiveEmDashTargetAdapter", () => {
  it("creates schema, syncs taxonomies, uploads media, and imports entries into EmDash", async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      const method = (init?.method ?? "GET").toUpperCase();

      if (url === "https://source.test/image.jpg") {
        return new Response("binary-image-data", {
          status: 200,
          headers: {
            "content-type": "image/jpeg"
          }
        });
      }

      if (url === "https://emdash.example/_emdash/api/schema/collections" && method === "GET") {
        return jsonResponse({ items: [] });
      }

      if (url === "https://emdash.example/_emdash/api/schema/collections" && method === "POST") {
        return jsonResponse({ item: { slug: "posts" } });
      }

      if (
        url === "https://emdash.example/_emdash/api/schema/collections/posts/fields" &&
        method === "GET"
      ) {
        return jsonResponse({ items: [] });
      }

      if (
        url === "https://emdash.example/_emdash/api/schema/collections/posts/fields" &&
        method === "POST"
      ) {
        return jsonResponse({ item: { slug: "created-field" } });
      }

      if (url === "https://emdash.example/_emdash/api/taxonomies" && method === "GET") {
        return jsonResponse({ taxonomies: [] });
      }

      if (url === "https://emdash.example/_emdash/api/taxonomies" && method === "POST") {
        return jsonResponse({ taxonomy: { name: "categories" } });
      }

      if (
        url === "https://emdash.example/_emdash/api/taxonomies/categories/terms" &&
        method === "GET"
      ) {
        return jsonResponse({ terms: [] });
      }

      if (
        url === "https://emdash.example/_emdash/api/taxonomies/categories/terms" &&
        method === "POST"
      ) {
        return jsonResponse({ term: { id: "emdash-term-category", slug: "news", label: "News" } });
      }

      if (url === "https://emdash.example/_emdash/api/taxonomies/tags/terms" && method === "GET") {
        return jsonResponse({ terms: [] });
      }

      if (url === "https://emdash.example/_emdash/api/taxonomies/tags/terms" && method === "POST") {
        return jsonResponse({ term: { id: "emdash-term-tag", slug: "launch", label: "Launch" } });
      }

      if (url === "https://emdash.example/_emdash/api/media/upload-url" && method === "POST") {
        return jsonResponse({
          uploadUrl: "https://upload.example/media-1",
          method: "PUT",
          headers: {},
          mediaId: "emdash-media-1",
          storageKey: "media-1.jpg",
          expiresAt: "2026-04-03T04:00:00.000Z"
        });
      }

      if (url === "https://upload.example/media-1" && method === "PUT") {
        return new Response(null, { status: 200 });
      }

      if (
        url === "https://emdash.example/_emdash/api/media/emdash-media-1/confirm" &&
        method === "POST"
      ) {
        return jsonResponse({ item: { id: "emdash-media-1" } });
      }

      if (url === "https://emdash.example/_emdash/api/content/posts" && method === "POST") {
        const payload = JSON.parse(String(init?.body)) as {
          data: {
            migration_content: Array<{ _type: string; style?: string }>;
            migration_meta: {
              taxonomyTerms: Array<{ emdashTermId: string | null }>;
              portableTextSkippedNodes: Array<{ kind: string }>;
            };
          };
        };
        expect(payload.data.migration_content[0]?.style).toBe("h2");
        expect(payload.data.migration_content[1]?._type).toBe("block");
        expect(payload.data.migration_meta.taxonomyTerms).toEqual([
          expect.objectContaining({ emdashTermId: "emdash-term-category" }),
          expect.objectContaining({ emdashTermId: "emdash-term-tag" })
        ]);
        expect(payload.data.migration_meta.portableTextSkippedNodes).toEqual([
          expect.objectContaining({ kind: "image" })
        ]);
        return jsonResponse({ item: { id: "emdash-entry-1" } });
      }

      throw new Error(`Unexpected fetch call: ${method} ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    const adapter = new LiveEmDashTargetAdapter();
    const result = await adapter.execute(plan, bundle, {
      url: "https://emdash.example",
      apiToken: "ec_pat_test"
    });

    expect(result.mode).toBe("imported");
    expect(result.collections).toEqual([{ collection: "posts", created: true }]);
    expect(result.fields).toHaveLength(6);
    expect(result.taxonomies).toEqual([
      { taxonomy: "categories", created: true, collections: ["posts"] },
      { taxonomy: "tags", created: true, collections: ["posts"] }
    ]);
    expect(result.terms).toEqual([
      { taxonomy: "categories", slug: "news", termId: "emdash-term-category", created: true },
      { taxonomy: "tags", slug: "launch", termId: "emdash-term-tag", created: true }
    ]);
    expect(result.media[0]).toMatchObject({
      sourceId: "media-1",
      mediaId: "emdash-media-1",
      reused: false
    });
    expect(result.entries[0]).toMatchObject({
      sourceId: "post-1",
      collection: "posts",
      entryId: "emdash-entry-1",
      status: "imported"
    });
    expect(result.failures).toHaveLength(0);
    expect(fetchMock).toHaveBeenCalled();
  });
});

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: {
      "content-type": "application/json"
    }
  });
}
