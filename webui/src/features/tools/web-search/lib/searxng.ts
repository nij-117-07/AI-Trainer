// src/features/tools/web-search/lib/searxng.ts
/**
 * SearXNG (self-hosted) search provider. Queries the instance's public JSON
 * API (`/search?format=json`), mapping the advanced filters to SearXNG
 * parameters: region → `language`, age → `time_range`, safe search →
 * `safesearch`, and pagination → `pageno`. Serves as the rate-limit-free
 * self-hosted alternative to the keyless DuckDuckGo scraping path.
 */
import type { SearchRequest, WebSearchResult } from "../types";
import type { SearchProviderPage } from "./duckduckgo";

const REQUEST_TIMEOUT_MS = 20_000;

/** SearXNG base URL is server-only configuration; no trailing slash. */
function searxngBaseUrl(): string {
  const raw = process.env.SEARXNG_API_URL ?? "http://127.0.0.1:8888";
  return raw.replace(/\/+$/, "");
}

/** Maps a DDG-style region code (`us-en`) to SearXNG (`en-US`). */
function toSearxLanguage(region: string): string | null {
  const [country = "", language = ""] = region.split("-");
  if (!language || country === "wt" || country === "") return null;
  return `${language}-${country.toUpperCase()}`;
}

const TIME_RANGE_MAP: Record<string, string> = {
  d: "day",
  w: "week",
  m: "month",
  y: "year",
};

const SAFE_SEARCH_MAP: Record<string, string> = {
  "-2": "0",
  "-1": "1",
  "1": "2",
};

function toHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function collectResults(entries: unknown[], limit: number, seen: Set<string>): WebSearchResult[] {
  const results: WebSearchResult[] = [];
  for (const entry of entries) {
    if (results.length >= limit) break;
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    if (typeof row.title !== "string" || typeof row.url !== "string") continue;
    if (!/^https?:\/\//.test(row.url) || seen.has(row.url)) continue;
    seen.add(row.url);
    results.push({
      title: row.title,
      url: row.url,
      host: toHost(row.url),
      snippet: typeof row.content === "string" ? row.content : "",
    });
  }
  return results;
}

/**
 * Searches the self-hosted SearXNG instance and returns one page of organic
 * results plus the state for pagination. Throws a readable error when the
 * instance is unreachable or does not return the JSON API payload.
 */
export async function searchSearxNg(
  request: SearchRequest,
  limit: number
): Promise<SearchProviderPage> {
  const params = new URLSearchParams({
    q: request.query,
    format: "json",
    pageno: String(request.page),
    safesearch: SAFE_SEARCH_MAP[request.safe_search] ?? "1",
  });
  const language = toSearxLanguage(request.region);
  if (language) params.set("language", language);
  const timeRange = TIME_RANGE_MAP[request.time_range];
  if (timeRange) params.set("time_range", timeRange);

  let response: Response;
  try {
    response = await fetch(`${searxngBaseUrl()}/search?${params.toString()}`, {
      method: "GET",
      headers: { "User-Agent": "AI-Trainer-WebUI (local search tool)" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new Error(
      `Unable to reach SearXNG (${searxngBaseUrl()}): ${
        error instanceof Error && error.name === "TimeoutError" ? "request timed out" : error instanceof Error ? error.message : "network error"
      }. Is the container running?`
    );
  }

  if (!response.ok) {
    throw new Error(`SearXNG request failed (HTTP ${response.status}).`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("SearXNG returned a non-JSON response.");
  }

  const body = payload as { results?: unknown[] };
  if (!body || !Array.isArray(body.results)) {
    throw new Error("SearXNG returned an unexpected response shape.");
  }

  const seen = new Set<string>();
  const results = collectResults(body.results, limit, seen);
  return {
    results,
    nextStart: results.length === limit ? request.page + 1 : null,
  };
}
