// src/features/tools/web-search/components/WebSearchPage.tsx
/**
 * Web Search tool page (keyless DuckDuckGo). Renders the persistent search
 * form with advanced filters on top and, below it, the result list styled
 * like a search engine: skeletons while the action is in flight, an active
 * filter summary, a "Load more" pager, and empty/error states.
 */
"use client";

import { Globe, ListPlus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SearchForm } from "./SearchForm";
import { SearchResultCard } from "./SearchResultCard";
import { useWebSearch } from "../hooks/useWebSearch";

function ResultSkeletons() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-sm" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ hasQueried }: { hasQueried: boolean }) {
  const Icon = hasQueried ? SearchX : Globe;
  const title = hasQueried ? "No results found" : "Search the web";
  const description = hasQueried
    ? "Nothing matched that query with the current filters. Try different words or widen the filters."
    : "Type a query above to find pages, posts, and docs — results link straight to their sources.";

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterBadges({ usedAdvanced }: { usedAdvanced: boolean }) {
  if (!usedAdvanced) return null;
  return (
    <Badge variant="secondary" className="text-[10px]">
      filtered
    </Badge>
  );
}

export function WebSearchPage() {
  const {
    results,
    page,
    query,
    engine,
    hasMore,
    isPending,
    hasQueried,
    usedAdvanced,
    error,
    submit,
    loadMore,
  } = useWebSearch();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Web Search</h1>
          <Badge variant="outline" className="text-[10px]">
            {engine === "searxng" ? "via SearXNG · self-hosted" : "via DuckDuckGo · no API key"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Search the open web and get plain page links, titles, and snippets —
          with region, date, and safe-search filters.
        </p>
      </header>

      <div className="sticky top-(--navbar-height) z-40 border-b bg-background/95 pb-3 pt-3 backdrop-blur">
        <Card>
          <CardContent className="p-4">
            <SearchForm
              defaultQuery={query}
              isPending={isPending}
              error={error}
              onSubmit={submit}
            />
          </CardContent>
        </Card>
      </div>

      {isPending && page === 1 ? (
        <ResultSkeletons />
      ) : results.length > 0 ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
              {page > 1 && (
                <span className="tabular-nums">· pages 1–{page}</span>
              )}
              <FilterBadges usedAdvanced={usedAdvanced} />
            </p>
          </div>
          <div className="space-y-3">
            {results.map((item, index) => (
              <SearchResultCard key={`${item.url}-${index}`} result={item} rank={index + 1} />
            ))}
          </div>
          {hasMore && !isPending && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={loadMore} className="gap-2">
                <ListPlus className="h-4 w-4" />
                Load more results
              </Button>
            </div>
          )}
          {isPending && page > 1 && (
            <div className="flex justify-center pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Skeleton className="h-4 w-24" />
                Loading more…
              </div>
            </div>
          )}
        </section>
      ) : isPending && page > 1 ? (
        <ResultSkeletons />
      ) : hasQueried || error !== null ? (
        <EmptyState hasQueried />
      ) : (
        <EmptyState hasQueried={false} />
      )}
    </div>
  );
}
