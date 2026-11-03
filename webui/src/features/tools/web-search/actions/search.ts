// src/features/tools/web-search/actions/search.ts
/**
 * Server Action for the Web Search tool. Validates the request, routes it to
 * the selected provider (keyless DuckDuckGo or self-hosted SearXNG), and
 * returns a Zod-validated response with title/url/snippet results plus
 * pagination state. Page 1 is a fresh search; pages ≥ 2 continue a previous
 * search via page/offset (and the DDG vqd token when applicable).
 */
"use server";

import {
  SearchFormSchema,
  WebSearchResponseSchema,
  type SearchRequest,
  type WebSearchResponse,
} from "../types";
import { searchDuckDuckGo, type SearchProviderPage } from "../lib/duckduckgo";
import { searchSearxNg } from "../lib/searxng";

const PROVIDERS: Record<
  SearchRequest["engine"],
  (request: SearchRequest, limit: number) => Promise<SearchProviderPage>
> = {
  duckduckgo: searchDuckDuckGo,
  searxng: searchSearxNg,
};

export async function searchWebAction(input: SearchRequest): Promise<WebSearchResponse> {
  const parsed = SearchFormSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  const request: SearchRequest = { ...parsed.data, page: Math.max(1, input.page ?? 1) };
  const limit = Number(request.result_count);
  const page = await PROVIDERS[request.engine](request, limit);

  const response: WebSearchResponse = {
    query: request.query,
    engine: request.engine,
    page: request.page,
    results: page.results,
    nextStart: page.nextStart,
    vqd: page.vqd,
    fetchedAt: new Date().toISOString(),
  };
  const validated = WebSearchResponseSchema.safeParse(response);
  if (!validated.success) {
    throw new Error(`Invalid search response: ${validated.error.issues.map((i) => i.message).join(", ")}`);
  }
  return validated.data;
}
