// src/features/web-search/lib/query.ts
/** Cleans the search query and checks it before a request is sent. */

export const MAX_QUERY_LENGTH = 300;

/** Trims the query and collapses runs of whitespace. Non-string input becomes an empty query. */
export function normalizeQuery(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim();
}

/** Returns a readable problem with the query, or null when it can be searched. */
export function queryError(query: string): string | null {
  if (!query) return "Enter what you want to search for.";
  if (query.length > MAX_QUERY_LENGTH) return `Maximum ${MAX_QUERY_LENGTH} characters.`;
  return null;
}
