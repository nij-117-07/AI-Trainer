// src/features/web-search/hooks/useWebSearch.ts
/** Search state for the Web Search tool: runs a fresh search, loads more pages, and keeps the filters used. */
import { useCallback, useState } from "react";
import { useRequest } from "@/hooks/useRequest";
import { runWebSearch } from "../lib/search";
import { appendUnique } from "../lib/pagination";
import { normalizeQuery, queryError } from "../lib/query";
import type { SearchFormValues, WebSearchResult } from "../types";

interface SearchMeta {
  values: SearchFormValues;
  page: number;
  hasMore: boolean;
  vqd?: string;
}

export function useWebSearch(searxngUrl: string) {
  const [results, setResults] = useState<WebSearchResult[]>([]);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const request = useRequest(runWebSearch);
  const { run } = request;

  const submit = useCallback(
    async (values: SearchFormValues) => {
      const query = normalizeQuery(values.query);
      const problem = queryError(query);
      setFormError(problem);
      if (problem) return;

      setResults([]);
      setMeta(null);
      const next = await run({ ...values, query, page: 1 }, searxngUrl);
      if (!next) return;
      setResults(next.results);
      setMeta({ values: { ...values, query }, page: next.page, hasMore: next.nextStart !== null, vqd: next.vqd });
    },
    [run, searxngUrl],
  );

  const loadMore = useCallback(async () => {
    if (!meta || !meta.hasMore) return;
    const next = await run({ ...meta.values, page: meta.page + 1, vqd: meta.vqd }, searxngUrl);
    if (!next) return;
    setResults((prev) => appendUnique(prev, next.results));
    setMeta({
      values: meta.values,
      page: next.page,
      hasMore: next.nextStart !== null,
      vqd: next.vqd ?? meta.vqd,
    });
  }, [meta, run, searxngUrl]);

  return {
    results,
    meta,
    isPending: request.pending,
    error: formError ?? request.error,
    submit,
    loadMore,
  };
}
