// src/features/tools/web-search/types/index.ts
/**
 * Zod schemas + TypeScript types for the Web Search tool. Defines the search
 * form (query + result count + advanced filters), the normalized result shape
 * returned by the scraping-based DuckDuckGo provider, and the responses for
 * both the initial search and its "load more" pages.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Advanced filter option catalogs
// ---------------------------------------------------------------------------

/** DuckDuckGo `kl` region codes for the region select. */
export const SEARCH_REGIONS = [
  { value: "wt-wt", label: "No region (global)" },
  { value: "us-en", label: "United States (English)" },
  { value: "uk-en", label: "United Kingdom (English)" },
  { value: "ca-en", label: "Canada (English)" },
  { value: "au-en", label: "Australia (English)" },
  { value: "in-en", label: "India (English)" },
  { value: "de-de", label: "Germany (German)" },
  { value: "fr-fr", label: "France (French)" },
  { value: "es-es", label: "Spain (Spanish)" },
  { value: "it-it", label: "Italy (Italian)" },
  { value: "pt-br", label: "Brazil (Portuguese)" },
  { value: "jp-jp", label: "Japan (Japanese)" },
  { value: "kr-kr", label: "South Korea (Korean)" },
] as const;

/** DuckDuckGo `df` age filters; "any" omits the parameter. */
export const TIME_RANGES = [
  { value: "any", label: "Any time" },
  { value: "d", label: "Past day" },
  { value: "w", label: "Past week" },
  { value: "m", label: "Past month" },
  { value: "y", label: "Past year" },
] as const;

/** DuckDuckGo `kp` safe search levels. */
export const SAFE_SEARCH_LEVELS = [
  { value: "-2", label: "Off" },
  { value: "-1", label: "Moderate" },
  { value: "1", label: "Strict" },
] as const;

// ---------------------------------------------------------------------------
// Search form / request
// ---------------------------------------------------------------------------

/** Available search backends; the user picks one in the form. */
export const ENGINE_OPTIONS = [
  { value: "duckduckgo", label: "DuckDuckGo" },
  { value: "searxng", label: "SearXNG (self-hosted)" },
] as const;

export type SearchEngine = (typeof ENGINE_OPTIONS)[number]["value"];

export const SearchFormSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Enter what you want to search for")
    .max(300, "Maximum 300 characters"),
  engine: z.enum(["duckduckgo", "searxng"]).default("duckduckgo"),
  result_count: z.enum(["5", "10", "20"]).default("10"),
  region: z.string().trim().min(1).max(10).default("wt-wt"),
  time_range: z.enum(["any", "d", "w", "m", "y"]).default("any"),
  safe_search: z.enum(["-2", "-1", "1"]).default("-1"),
});
export type SearchFormValues = z.infer<typeof SearchFormSchema>;

/** Full request for one page of results (page numbering starts at 1). */
export interface SearchRequest extends SearchFormValues {
  page: number;
  /** DDG session token from the previous response; required for page ≥ 2. */
  vqd?: string;
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

export const WebSearchResultSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  host: z.string(),
  snippet: z.string(),
});
export type WebSearchResult = z.infer<typeof WebSearchResultSchema>;

export const WebSearchResponseSchema = z.object({
  query: z.string(),
  engine: z.enum(["duckduckgo", "searxng"]),
  page: z.number().int().min(1),
  results: z.array(WebSearchResultSchema),
  /** Offset to send as `s` for the next page; null when no more pages. */
  nextStart: z.number().int().min(0).nullable(),
  /** Session token to send with the next page when paginating. */
  vqd: z.string().optional(),
  fetchedAt: z.string(),
});
export type WebSearchResponse = z.infer<typeof WebSearchResponseSchema>;


/** True when any advanced filter deviates from its default. */
export function hasAdvancedFilters(values: SearchFormValues): boolean {
  return (
    values.region !== "wt-wt" ||
    values.time_range !== "any" ||
    values.safe_search !== "-1"
  );
}
