// src/features/web-search/lib/pagination.ts
/** Pagination helpers shared by the search providers. */
import type { WebSearchResult } from "../types";

/** Offset DuckDuckGo expects in `s` for a 1-based page. */
export function duckDuckGoOffset(page: number, limit: number): number {
  return Math.max(0, page - 1) * limit;
}

/** A full page suggests more results may exist; a short or empty page ends the stream. */
export function hasNextPage(resultCount: number, limit: number): boolean {
  return resultCount > 0 && resultCount === limit;
}

/** Appends results whose URL is not already listed, keeping their order. */
export function appendUnique(previous: WebSearchResult[], next: WebSearchResult[]): WebSearchResult[] {
  const seen = new Set(previous.map((item) => item.url));
  const fresh = next.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
  return [...previous, ...fresh];
}
