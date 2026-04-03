import type { MediaImportPlan } from "@wp2emdash/shared-types";

const DEFAULT_API_BASE_PATH = "/_emdash/api";
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

interface EmDashApiEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
}

export interface EmDashCollectionRecord {
  slug: string;
}

export interface EmDashFieldRecord {
  slug: string;
  type?: string;
}

export interface EmDashTaxonomyRecord {
  name: string;
  label: string;
  hierarchical?: boolean;
  collections?: string[];
}

export interface EmDashTermRecord {
  id: string;
  slug: string;
  label: string;
  parentId?: string | null;
}

export interface EmDashContentRecord {
  id: string;
}

interface EmDashMediaRecord {
  id: string;
}

interface EmDashUploadUrlResponse {
  existing?: true;
  uploadUrl?: string;
  method?: "PUT";
  headers?: Record<string, string>;
  mediaId: string;
  storageKey: string;
  url?: string;
  expiresAt?: string;
}

export interface EmDashTargetRequest {
  url: string;
  apiToken?: string;
}

export interface EmDashConnectionCheck {
  key: "schema" | "taxonomies";
  label: string;
  ok: boolean;
  detail: string;
}

export interface EmDashConnectionResult {
  ok: boolean;
  apiBaseUrl: string;
  checks: EmDashConnectionCheck[];
  note: string;
}

export class EmDashApiClient {
  constructor(private readonly target: EmDashTargetRequest) {
    if (!target.apiToken) {
      throw new Error("An EmDash API token is required for this action.");
    }
  }

  get apiBaseUrl(): string {
    return normalizeEmDashApiBaseUrl(this.target.url);
  }

  async listCollections(): Promise<EmDashCollectionRecord[]> {
    const response = await this.requestJson<{ items: EmDashCollectionRecord[] }>(
      `${this.apiBaseUrl}/schema/collections`,
      { method: "GET" }
    );
    return response.items;
  }

  async createCollection(payload: {
    slug: string;
    label: string;
    labelSingular: string;
    supports: string[];
    source: string;
  }): Promise<void> {
    await this.requestJson(
      `${this.apiBaseUrl}/schema/collections`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
  }

  async listFields(collection: string): Promise<EmDashFieldRecord[]> {
    const response = await this.requestJson<{ items: EmDashFieldRecord[] }>(
      `${this.apiBaseUrl}/schema/collections/${encodeURIComponent(collection)}/fields`,
      { method: "GET" }
    );
    return response.items;
  }

  async createField(
    collection: string,
    payload: {
      slug: string;
      label: string;
      type: string;
      required?: boolean;
      searchable?: boolean;
    }
  ): Promise<void> {
    await this.requestJson(
      `${this.apiBaseUrl}/schema/collections/${encodeURIComponent(collection)}/fields`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
  }

  async listTaxonomies(): Promise<EmDashTaxonomyRecord[]> {
    const response = await this.requestJson<{ taxonomies: EmDashTaxonomyRecord[] }>(
      `${this.apiBaseUrl}/taxonomies`,
      { method: "GET" }
    );
    return response.taxonomies;
  }

  async createTaxonomy(payload: {
    name: string;
    label: string;
    hierarchical: boolean;
    collections: string[];
  }): Promise<void> {
    await this.requestJson(
      `${this.apiBaseUrl}/taxonomies`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
  }

  async listTerms(taxonomy: string): Promise<EmDashTermRecord[]> {
    const response = await this.requestJson<{ terms: EmDashTermRecord[] }>(
      `${this.apiBaseUrl}/taxonomies/${encodeURIComponent(taxonomy)}/terms`,
      { method: "GET" }
    );
    return response.terms;
  }

  async createTerm(
    taxonomy: string,
    payload: {
      slug: string;
      label: string;
      description?: string;
      parentId?: string;
    }
  ): Promise<EmDashTermRecord> {
    const response = await this.requestJson<{ term: EmDashTermRecord }>(
      `${this.apiBaseUrl}/taxonomies/${encodeURIComponent(taxonomy)}/terms`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
    return response.term;
  }

  async importMedia(media: MediaImportPlan): Promise<{
    sourceId: string;
    filename: string;
    mediaId?: string;
    reused: boolean;
    sourceUrl: string;
  }> {
    const sourceResponse = await fetch(media.url);
    if (!sourceResponse.ok) {
      throw new Error(
        `Unable to fetch source media ${media.url} (${sourceResponse.status}).`
      );
    }

    const body = await sourceResponse.arrayBuffer();
    const contentType =
      media.mimeType ??
      sourceResponse.headers.get("content-type") ??
      "application/octet-stream";

    const upload = await this.requestJson<EmDashUploadUrlResponse>(
      `${this.apiBaseUrl}/media/upload-url`,
      {
        method: "POST",
        body: JSON.stringify({
          filename: media.filename,
          contentType,
          size: body.byteLength
        })
      }
    );

    if (!upload.existing && upload.uploadUrl && upload.method) {
      const uploadResponse = await fetch(upload.uploadUrl, {
        method: upload.method,
        headers: upload.headers,
        body
      });
      if (!uploadResponse.ok) {
        throw new Error(
          `Unable to upload media ${media.filename} to the EmDash storage endpoint (${uploadResponse.status}).`
        );
      }

      await this.requestJson<{ item: EmDashMediaRecord }>(
        `${this.apiBaseUrl}/media/${encodeURIComponent(upload.mediaId)}/confirm`,
        {
          method: "POST",
          body: JSON.stringify({
            size: body.byteLength
          })
        }
      );
    }

    return {
      sourceId: media.sourceId,
      filename: media.filename,
      mediaId: upload.mediaId,
      reused: upload.existing === true,
      sourceUrl: media.url
    };
  }

  async createContent(
    collection: string,
    payload: {
      slug: string;
      status: string;
      data: Record<string, unknown>;
    }
  ): Promise<EmDashContentRecord> {
    const response = await this.requestJson<{ item: EmDashContentRecord }>(
      `${this.apiBaseUrl}/content/${encodeURIComponent(collection)}`,
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    );
    return response.item;
  }

  private async requestJson<T>(url: string, init: RequestInit): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${this.target.apiToken}`);
    if (!headers.has("Content-Type") && init.body) {
      headers.set("Content-Type", "application/json");
    }
    if (WRITE_METHODS.has((init.method ?? "GET").toUpperCase())) {
      headers.set("X-EmDash-Request", "1");
    }

    const response = await fetch(url, {
      ...init,
      headers
    });

    return unwrapApiResponse<T>(response);
  }
}

export async function testEmDashConnection(
  target: EmDashTargetRequest
): Promise<EmDashConnectionResult> {
  const client = new EmDashApiClient(target);
  const checks: EmDashConnectionCheck[] = [];

  try {
    await client.listCollections();
    checks.push({
      key: "schema",
      label: "Schema collections",
      ok: true,
      detail: "Schema API responded successfully."
    });
  } catch (error) {
    checks.push({
      key: "schema",
      label: "Schema collections",
      ok: false,
      detail: asErrorMessage(error)
    });
  }

  try {
    await client.listTaxonomies();
    checks.push({
      key: "taxonomies",
      label: "Taxonomies",
      ok: true,
      detail: "Taxonomy API responded successfully."
    });
  } catch (error) {
    checks.push({
      key: "taxonomies",
      label: "Taxonomies",
      ok: false,
      detail: asErrorMessage(error)
    });
  }

  const ok = checks.every((check) => check.ok);
  return {
    ok,
    apiBaseUrl: client.apiBaseUrl,
    checks,
    note: ok
      ? `Connected to ${client.apiBaseUrl} and verified schema/taxonomy access.`
      : `Connection test reached ${client.apiBaseUrl}, but one or more API checks failed.`
  };
}

export function normalizeEmDashApiBaseUrl(targetUrl: string): string {
  const normalized = targetUrl.trim().replace(/\/+$/, "");
  if (normalized.endsWith(DEFAULT_API_BASE_PATH)) {
    return normalized;
  }
  return `${normalized}${DEFAULT_API_BASE_PATH}`;
}

async function unwrapApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as EmDashApiEnvelope<T> | T) : undefined;

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "object" &&
      payload.error !== null &&
      "message" in payload.error
        ? String(payload.error.message)
        : text || `Request failed with ${response.status}`;
    throw new Error(message);
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    payload.data !== undefined
  ) {
    return payload.data as T;
  }

  return payload as T;
}

function asErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown EmDash API error.";
}
