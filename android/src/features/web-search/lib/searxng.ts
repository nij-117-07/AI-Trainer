// src/features/web-search/lib/searxng.ts
/**
 * Self-hosted SearXNG provider. Calls the instance's JSON API (`/search?format=json`) at an
 * address the user enters in the form. The filters map to SearXNG parameters: region →
 * `language`, age → `time_range`, safe search → `safesearch`, and paging → `pageno`.
 */
import { fetchWithTimeout, toFormBody } from "./http";
import { hasNextPage } from "./pagination";
import { toHost } from "./url";
import type { ProviderPage, SearchRequest, WebSearchResult } from "../types";

const REQUEST_TIMEOUT_MS = 20_000;
const USER_AGENT = "AI-Trainer-Android (web search tool)";

const TIME_RANGE_PARAM: Record<string, string> = { d: "day", w: "week", m: "month", y: "year" };
const SAFE_SEARCH_PARAM: Record<string, string> = { "-2": "0", "-1": "1", "1": "2" };

/** Returns the instance address without trailing slashes, or null when it is not an http(s) URL. */
export function normalizeSearxngUrl(raw: string): string | null {
  const trimmed = raw.trim().replace(/\/+$/, "");
  return /^https?:\/\/[^\s/]+/i.test(trimmed) ? trimmed : null;
}

/** Maps a DuckDuckGo-style region (`us-en`) to a SearXNG language tag (`en-US`). */
export function toSearxLanguage(region: string): string | null {
  const [country = "", language = ""] = region.split("-");
  if (!language || !country || country === "wt") return null;
  return `${language}-${country.toUpperCase()}`;
}

export function buildSearxngQuery(request: SearchRequest): string {
  const entries: [string, string][] = [
    ["q", request.query],
    ["format", "json"],
    ["pageno", String(request.page)],
    ["safesearch", SAFE_SEARCH_PARAM[request.safeSearch] ?? "1"],
  ];
  const language = toSearxLanguage(request.region);
  if (language) entries.push(["language", language]);
  const timeRange = TIME_RANGE_PARAM[request.timeRange];
  if (timeRange) entries.push(["time_range", timeRange]);
  return toFormBody(entries);
}

/** Reads the `results` array from a SearXNG JSON payload, de-duplicating by URL. */
export function parseSearxngResults(payload: unknown, limit: number): WebSearchResult[] {
  const rows = payload && typeof payload === "object" ? (payload as { results?: unknown }).results : undefined;
  if (!Array.isArray(rows)) {
    throw new Error("SearXNG returned an unexpected response shape.");
  }

  const results: WebSearchResult[] = [];
  const seen = new Set<string>();
  for (const entry of rows) {
    if (results.length >= limit) break;
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    if (typeof row.title !== "string" || typeof row.url !== "string") continue;
    if (!/^https?:\/\//i.test(row.url) || seen.has(row.url)) continue;
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

/** Returns one page of SearXNG results. Throws a readable error when the instance is unusable. */
export async function searchSearxng(request: SearchRequest, limit: number, baseUrl: string): Promise<ProviderPage> {
  const origin = normalizeSearxngUrl(baseUrl);
  if (!origin) {
    throw new Error("Enter a valid SearXNG address, such as http://192.168.1.20:8888.");
  }

  const response = await fetchWithTimeout(
    `SearXNG (${origin})`,
    `${origin}/search?${buildSearxngQuery(request)}`,
    { method: "GET", headers: { "User-Agent": USER_AGENT } },
    REQUEST_TIMEOUT_MS,
  );
  if (!response.ok) {
    throw new Error(`SearXNG request failed (HTTP ${response.status}).`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("SearXNG returned a non-JSON response. Check that JSON output is enabled on the instance.");
  }

  const results = parseSearxngResults(payload, limit);
  return {
    results,
    nextStart: hasNextPage(results.length, limit) ? request.page + 1 : null,
  };
}
