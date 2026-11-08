// src/features/web-search/lib/search.ts
/** Runs one page of a web search on the selected engine. */
import { searchDuckDuckGo } from "./duckduckgo";
import { searchSearxng } from "./searxng";
import type { SearchRequest, WebSearchPage } from "../types";

export async function runWebSearch(request: SearchRequest, searxngUrl: string): Promise<WebSearchPage> {
  const provider =
    request.engine === "searxng"
      ? await searchSearxng(request, request.resultCount, searxngUrl)
      : await searchDuckDuckGo(request, request.resultCount);

  return {
    ...provider,
    query: request.query,
    engine: request.engine,
    page: request.page,
  };
}
