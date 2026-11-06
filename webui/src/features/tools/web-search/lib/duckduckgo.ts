// src/features/tools/web-search/lib/duckduckgo.ts
/**
 * Server-side DuckDuckGo web results without an API key. Posts the query to
 * the public `/html` endpoint and parses the organic result anchors
 * (`result__a`) with their snippets; falls back to the lighter `/lite` markup
 * when the html endpoint fails or yields nothing. Supports the advanced
 * search filters DDG exposes natively: region (`kl`), age (`df`), safe search
 * (`kp`), and offset-based pagination (`s`/`dc` + `vqd` session token).
 * Links wrapped in DDG redirectors (`/l/?uddg=…`) are unwrapped.
 */
import type { SearchRequest, WebSearchResult } from "../types";

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_HTML_CHARS = 3_000_000;

const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface AnchorHit {
  start: number;
  end: number;
  title: string;
  url: string;
}

/** One page of results from any search provider (DDG html/lite, SearXNG). */
export interface SearchProviderPage {
  results: WebSearchResult[];
  /** Offset / state for the next page, null when the stream ended. */
  nextStart: number | null;
  /** DDG session token for paginating; captured from the page markup. */
  vqd?: string;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/** Decodes HTML entities and strips nested tags from scraped text. */
function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Resolves a scraped href to a real http(s) destination URL. */
function resolveHref(href: string): string | null {
  let url = href.replace(/&amp;/g, "&");
  if (url.startsWith("//")) url = `https:${url}`;

  const redirectParam = /[?&]uddg=([^&]+)/.exec(url);
  if (redirectParam) {
    try {
      url = decodeURIComponent(redirectParam[1]);
    } catch {
      return null;
    }
  }

  if (url.includes("duckduckgo.com/y.js")) return null; // sponsored
  if (!/^https?:\/\//.test(url)) return null;
  return url;
}

function toHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** First regex match group for `href="…"` inside a raw anchor tag. */
function extractHref(tag: string): string | null {
  const match = /href\s*=\s*["']([^"']+)["']/.exec(tag);
  return match ? match[1] : null;
}

interface ParsedPage {
  hits: AnchorHit[];
  snippets: Array<{ start: number; text: string }>;
}

function collectResults(page: ParsedPage, limit: number): WebSearchResult[] {
  const results: WebSearchResult[] = [];
  const seen = new Set<string>();
  for (const hit of page.hits) {
    if (results.length >= limit) break;
    if (seen.has(hit.url)) continue;
    seen.add(hit.url);
    const snippet = page.snippets.find((item) => item.start > hit.end)?.text ?? "";
    results.push({ title: hit.title, url: hit.url, host: toHost(hit.url), snippet });
  }
  return results;
}

/** Parses the `/html` endpoint markup (anchors: result__a, snippets: result__snippet). */
function parseHtmlResults(html: string): ParsedPage {
  const hits: AnchorHit[] = [];
  const anchorRe = /<a\b[^>]*class="[^"]*\bresult__a\b[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchorRe)) {
    const tag = match[0];
    const href = extractHref(tag);
    const url = href ? resolveHref(href) : null;
    if (!url) continue;
    hits.push({ start: match.index, end: match.index + tag.length, title: cleanText(match[1]), url });
  }

  const snippets: Array<{ start: number; text: string }> = [];
  const snippetRe = /<a\b[^>]*class="[^"]*\bresult__snippet\b[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(snippetRe)) {
    snippets.push({ start: match.index, text: cleanText(match[1]) });
  }

  return { hits, snippets };
}

/** Parses the `/lite` endpoint markup (anchors: result-link, snippets: result-snippet). */
function parseLiteResults(html: string): ParsedPage {
  const hits: AnchorHit[] = [];
  const anchorRe = /<a\b[^>]*class=['"]\bresult-link\b['"][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchorRe)) {
    const tag = match[0];
    const href = extractHref(tag);
    const url = href ? resolveHref(href) : null;
    if (!url) continue;
    hits.push({ start: match.index, end: match.index + tag.length, title: cleanText(match[1]), url });
  }

  const snippets: Array<{ start: number; text: string }> = [];
  const snippetRe = /<td\b[^>]*class=['"]\bresult-snippet\b['"][^>]*>([\s\S]*?)<\/td>/gi;
  for (const match of html.matchAll(snippetRe)) {
    snippets.push({ start: match.index, text: cleanText(match[1]) });
  }

  return { hits, snippets };
}

/** Extracts the DDG session token (vqd) needed for paginated requests. */
function extractVqd(html: string): string | undefined {
  const match = /vqd=['"]?([\d-]{6,})/.exec(html);
  return match ? match[1] : undefined;
}

function looksLikeChallenge(html: string): boolean {
  const head = html.toLowerCase().slice(0, 3000);
  return head.includes("anomaly") || head.includes("captcha") || head.includes("challenge");
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

function buildRequestBody(request: SearchRequest): URLSearchParams {
  const body = new URLSearchParams({ q: request.query, kl: request.region });
  if (request.time_range !== "any") body.set("df", request.time_range);
  body.set("kp", request.safe_search);

  if (request.page > 1) {
    const start = (request.page - 1) * Number(request.result_count);
    body.set("s", String(start));
    body.set("dc", String(start + 1));
    if (request.vqd) body.set("vqd", request.vqd);
  }
  return body;
}

/** Fetches a DuckDuckGo endpoint as text, throwing a readable error on failure. */
async function fetchEndpoint(url: string, body: URLSearchParams): Promise<string> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": BROWSER_UA,
      },
      body: body.toString(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new Error(
      `Unable to reach DuckDuckGo: ${error instanceof Error ? error.message : "network error"}`
    );
  }

  if (!response.ok) {
    throw new Error(`DuckDuckGo request failed (HTTP ${response.status}).`);
  }

  const text = await response.text();
  if (text.length > MAX_HTML_CHARS) {
    throw new Error("DuckDuckGo returned an unexpectedly large page.");
  }
  return text;
}

function finalizePage(
  page: ParsedPage,
  request: SearchRequest,
  limit: number,
  html: string
): SearchProviderPage {
  const results = collectResults(page, limit);
  const start = (request.page - 1) * limit;
  return {
    results,
    nextStart: results.length === limit ? start + results.length : null,
    vqd: extractVqd(html),
  };
}

/**
 * Searches the web via DuckDuckGo and returns one page of organic results
 * with real destination links, plus the offset/token for the next page.
 * Tries `/html` first, then `/lite`.
 */
export async function searchDuckDuckGo(
  request: SearchRequest,
  limit: number
): Promise<SearchProviderPage> {
  const body = buildRequestBody(request);
  const html = await fetchEndpoint("https://html.duckduckgo.com/html/", body);

  if (!looksLikeChallenge(html)) {
    const page = parseHtmlResults(html);
    if (page.hits.length > 0) return finalizePage(page, request, limit, html);
  }

  // Fallback: the lighter endpoint. Note: /lite honors q/kl/kp but not df.
  const liteBody = new URLSearchParams({ q: request.query, kl: request.region });
  liteBody.set("kp", request.safe_search);
  if (request.page > 1) liteBody.set("s", String((request.page - 1) * limit));
  const lite = await fetchEndpoint("https://lite.duckduckgo.com/lite/", liteBody);
  const results = parseLiteResults(lite);
  if (results.hits.length === 0) {
    throw new Error("No results found. DuckDuckGo may be rate-limiting us — try again shortly.");
  }
  return finalizePage(results, request, limit, lite);
}
