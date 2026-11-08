// src/features/web-search/types.ts
/** Types for the Web Search tool: the form, one search request, and the normalised results. */

export type SearchEngine = "duckduckgo" | "searxng";
export type ResultCount = 5 | 10 | 20;
export type TimeRange = "any" | "d" | "w" | "m" | "y";
export type SafeSearch = "-2" | "-1" | "1";

export interface SearchFormValues {
  query: string;
  engine: SearchEngine;
  resultCount: ResultCount;
  region: string;
  timeRange: TimeRange;
  safeSearch: SafeSearch;
}

/** One page of a search. Page numbering starts at 1. */
export interface SearchRequest extends SearchFormValues {
  page: number;
  /** DuckDuckGo session token from the previous page; required for page 2 and later. */
  vqd?: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  host: string;
  snippet: string;
}

/** Output of one provider call. `nextStart` is null when the result stream has ended. */
export interface ProviderPage {
  results: WebSearchResult[];
  nextStart: number | null;
  vqd?: string;
}

export interface WebSearchPage extends ProviderPage {
  query: string;
  engine: SearchEngine;
  page: number;
}
