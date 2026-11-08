// src/features/web-search/lib/duckduckgo.ts
/**
 * Keyless DuckDuckGo search. Posts the query to the `/html` endpoint and parses the organic
 * result anchors (`result__a`) with their snippets. Falls back to the lighter `/lite` markup when
 * `/html` is blocked or empty. Paging uses the `s` offset plus the `vqd` token from page 1.
 */
import { fetchWithTimeout, toFormBody } from "./http";
import { duckDuckGoOffset, hasNextPage } from "./pagination";
import { cleanText, toHost, unwrapResultUrl } from "./url";
import type { ProviderPage, SearchRequest, WebSearchResult } from "../types";

const HTML_ENDPOINT = "https://html.duckduckgo.com/html/";
const LITE_ENDPOINT = "https://lite.duckduckgo.com/lite/";
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_PAGE_CHARS = 3_000_000;
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface Anchor {
  start: number;
  end: number;
  title: string;
  url: string;
}

interface Snippet {
  start: number;
  text: string;
}

function collectResults(anchors: Anchor[], snippets: Snippet[], limit: number): WebSearchResult[] {
  const results: WebSearchResult[] = [];
  const seen = new Set<string>();
  for (const anchor of anchors) {
    if (results.length >= limit) break;
    if (seen.has(anchor.url)) continue;
    seen.add(anchor.url);
    const snippet = snippets.find((item) => item.start > anchor.end)?.text ?? "";
    results.push({ title: anchor.title, url: anchor.url, host: toHost(anchor.url), snippet });
  }
  return results;
}

function anchorsFrom(html: string, pattern: RegExp): Anchor[] {
  const anchors: Anchor[] = [];
  for (const match of html.matchAll(pattern)) {
    const tag = match[0];
    const href = /href\s*=\s*["']([^"']+)["']/.exec(tag);
    const url = href ? unwrapResultUrl(href[1]) : null;
    if (!url) continue;
    const start = match.index ?? 0;
    anchors.push({ start, end: start + tag.length, title: cleanText(match[1]), url });
  }
  return anchors;
}

function snippetsFrom(html: string, pattern: RegExp): Snippet[] {
  return Array.from(html.matchAll(pattern), (match) => ({
    start: match.index ?? 0,
    text: cleanText(match[1]),
  }));
}

/** Parses `/html` markup: anchors use `result__a`, snippets use `result__snippet`. */
export function parseDuckDuckGoHtml(html: string, limit: number): WebSearchResult[] {
  const anchors = anchorsFrom(html, /<a\b[^>]*class="[^"]*\bresult__a\b[^"]*"[^>]*>([\s\S]*?)<\/a>/gi);
  const snippets = snippetsFrom(html, /<a\b[^>]*class="[^"]*\bresult__snippet\b[^"]*"[^>]*>([\s\S]*?)<\/a>/gi);
  return collectResults(anchors, snippets, limit);
}

/** Parses `/lite` markup: anchors use `result-link`, snippets sit in `result-snippet` cells. */
export function parseDuckDuckGoLite(html: string, limit: number): WebSearchResult[] {
  const anchors = anchorsFrom(html, /<a\b[^>]*class=['"]\bresult-link\b['"][^>]*>([\s\S]*?)<\/a>/gi);
  const snippets = snippetsFrom(html, /<td\b[^>]*class=['"]\bresult-snippet\b['"][^>]*>([\s\S]*?)<\/td>/gi);
  return collectResults(anchors, snippets, limit);
}

/** Session token DuckDuckGo embeds in the page, needed to request later pages. */
export function extractVqd(html: string): string | undefined {
  const match = /vqd=['"]?([\d-]{6,})/.exec(html);
  return match ? match[1] : undefined;
}

export function looksLikeChallenge(html: string): boolean {
  const head = html.toLowerCase().slice(0, 3000);
  return head.includes("anomaly") || head.includes("captcha") || head.includes("challenge");
}

export function buildHtmlBody(request: SearchRequest, limit: number): string {
  const entries: [string, string][] = [
    ["q", request.query],
    ["kl", request.region],
  ];
  if (request.timeRange !== "any") entries.push(["df", request.timeRange]);
  entries.push(["kp", request.safeSearch]);

  if (request.page > 1) {
    const start = duckDuckGoOffset(request.page, limit);
    entries.push(["s", String(start)], ["dc", String(start + 1)]);
    if (request.vqd) entries.push(["vqd", request.vqd]);
  }
  return toFormBody(entries);
}

export function buildLiteBody(request: SearchRequest, limit: number): string {
  const entries: [string, string][] = [
    ["q", request.query],
    ["kl", request.region],
    ["kp", request.safeSearch],
  ];
  if (request.page > 1) entries.push(["s", String(duckDuckGoOffset(request.page, limit))]);
  return toFormBody(entries);
}

async function postForm(url: string, body: string): Promise<string> {
  const response = await fetchWithTimeout(
    "DuckDuckGo",
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": USER_AGENT,
      },
      body,
    },
    REQUEST_TIMEOUT_MS,
  );
  if (!response.ok) {
    throw new Error(`DuckDuckGo request failed (HTTP ${response.status}).`);
  }
  const text = await response.text();
  if (text.length > MAX_PAGE_CHARS) {
    throw new Error("DuckDuckGo returned an unexpectedly large page.");
  }
  return text;
}

function toPage(results: WebSearchResult[], request: SearchRequest, limit: number, html: string): ProviderPage {
  return {
    results,
    nextStart: hasNextPage(results.length, limit) ? duckDuckGoOffset(request.page, limit) + results.length : null,
    vqd: extractVqd(html),
  };
}

/** Returns one page of DuckDuckGo results with real destination links. */
export async function searchDuckDuckGo(request: SearchRequest, limit: number): Promise<ProviderPage> {
  const html = await postForm(HTML_ENDPOINT, buildHtmlBody(request, limit));
  if (!looksLikeChallenge(html)) {
    const results = parseDuckDuckGoHtml(html, limit);
    if (results.length > 0) return toPage(results, request, limit, html);
  }

  const lite = await postForm(LITE_ENDPOINT, buildLiteBody(request, limit));
  const results = parseDuckDuckGoLite(lite, limit);
  if (results.length === 0) {
    throw new Error("No results found. DuckDuckGo may be rate-limiting us. Try again shortly.");
  }
  return toPage(results, request, limit, lite);
}
