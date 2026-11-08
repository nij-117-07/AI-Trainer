// src/features/web-search/options.ts
/** Form defaults and option catalogs for the Web Search tool, mirroring the webui. */
import type { ResultCount, SafeSearch, SearchEngine, SearchFormValues, TimeRange } from "./types";

export const ENGINE_OPTIONS: { value: SearchEngine; label: string }[] = [
  { value: "duckduckgo", label: "DuckDuckGo" },
  { value: "searxng", label: "SearXNG (self-hosted)" },
];

export const RESULT_COUNT_OPTIONS: { value: ResultCount; label: string }[] = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
];

/** DuckDuckGo `kl` region codes. */
export const SEARCH_REGIONS: { value: string; label: string }[] = [
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
];

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "d", label: "Past day" },
  { value: "w", label: "Past week" },
  { value: "m", label: "Past month" },
  { value: "y", label: "Past year" },
];

export const SAFE_SEARCH_OPTIONS: { value: SafeSearch; label: string }[] = [
  { value: "-2", label: "Off" },
  { value: "-1", label: "Moderate" },
  { value: "1", label: "Strict" },
];

export const DEFAULT_SEARXNG_URL = "http://127.0.0.1:8888";
export const SEARXNG_URL_KEY = "tools.web-search.searxng-url.v1";

export const DEFAULT_FORM: SearchFormValues = {
  query: "",
  engine: "duckduckgo",
  resultCount: 10,
  region: "wt-wt",
  timeRange: "any",
  safeSearch: "-1",
};

/** True when any advanced filter differs from its default. */
export function hasAdvancedFilters(values: Pick<SearchFormValues, "region" | "timeRange" | "safeSearch">): boolean {
  return values.region !== "wt-wt" || values.timeRange !== "any" || values.safeSearch !== "-1";
}
