// src/features/tools/web-search/hooks/useWebSearch.ts
/**
 * Search state for the Web Search tool. Wraps the search Server Action with
 * useToolRequest for pending/error UX, accumulates results across "Load
 * more" pages (de-duplicated by URL), and keeps the engine, filters, and
 * pagination state from the latest page.
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { searchWebAction } from "../actions/search";
import {
  hasAdvancedFilters,
  type SearchEngine,
  type SearchFormValues,
  type SearchRequest,
  type WebSearchResponse,
  type WebSearchResult,
} from "../types";

interface SearchMeta {
  query: string;
  engine: SearchEngine;
  result_count: SearchFormValues["result_count"];
  region: SearchFormValues["region"];
  time_range: SearchFormValues["time_range"];
  safe_search: SearchFormValues["safe_search"];
  page: number;
  nextStart: number | null;
  vqd?: string;
}

export function useWebSearch() {
  /** Accumulated results across loaded pages, in order. */
  const [results, setResults] = useState<WebSearchResult[]>([]);
  /** Latest page metadata (engine, filters, page number, next page state). */
  const [meta, setMeta] = useState<SearchMeta | null>(null);

  // useToolRequest's onSuccess only receives the response, so the request
  // being executed is held here to reconstruct filter metadata on success.
  const lastInputRef = useRef<SearchRequest | null>(null);

  const request = useToolRequest<SearchRequest, WebSearchResponse>({
    run: searchWebAction,
    onSuccess: (response) => {
      const input = lastInputRef.current;
      setResults((prev) => {
        if (response.page === 1) return response.results;
        const seen = new Set(prev.map((item) => item.url));
        return [...prev, ...response.results.filter((item) => !seen.has(item.url))];
      });
      setMeta({
        query: response.query,
        engine: response.engine,
        result_count: input?.result_count ?? "10",
        region: input?.region ?? "wt-wt",
        time_range: input?.time_range ?? "any",
        safe_search: input?.safe_search ?? "-1",
        page: response.page,
        nextStart: response.nextStart,
        vqd: response.vqd,
      });
      toast.success(response.page === 1 ? "Search complete" : "More results loaded", {
        description: `${response.results.length} result${response.results.length === 1 ? "" : "s"} via ${response.engine === "searxng" ? "SearXNG" : "DuckDuckGo"} for "${response.query}".`,
      });
    },
  });

  /** Runs a fresh search (resets any accumulated results). */
  const submit = useCallback(
    (values: SearchFormValues) => {
      const input: SearchRequest = { ...values, page: 1 };
      lastInputRef.current = input;
      setResults([]);
      request.execute(input);
    },
    [request]
  );

  /** Continues the current search with the next page of the same engine. */
  const loadMore = useCallback(() => {
    if (!meta || meta.nextStart === null) return;
    const input: SearchRequest = {
      query: meta.query,
      engine: meta.engine,
      result_count: meta.result_count,
      region: meta.region,
      time_range: meta.time_range,
      safe_search: meta.safe_search,
      page: meta.page + 1,
      vqd: meta.vqd,
    };
    lastInputRef.current = input;
    request.execute(input);
  }, [meta, request]);

  const clear = useCallback(() => {
    request.reset();
    setResults([]);
    setMeta(null);
  }, [request]);

  const hasMore = meta !== null && meta.nextStart !== null;

  return {
    results,
    page: meta?.page ?? 0,
    query: meta?.query ?? "",
    engine: meta?.engine ?? null,
    hasMore,
    isPending: request.isPending,
    hasQueried: meta !== null,
    /** True when the current search uses region/time/safe-search filters. */
    usedAdvanced: meta ? hasAdvancedFilters(meta as SearchFormValues) : false,
    error: request.error,
    submit,
    loadMore,
    clear,
  };
}

export type WebSearch = ReturnType<typeof useWebSearch>;
