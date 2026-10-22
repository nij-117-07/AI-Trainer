// src/features/tools/rss/components/viewer/RssViewerPage.tsx
/**
 * RSS Feed Viewer page. Loads feed providers, fetches their items through the
 * useFeedViewer hook, and renders the FilterBar plus the filtered item list.
 * Shows skeletons while fetching, an error banner on failure, and empty
 * states for "no feeds" / "no results".
 */
"use client";

import { Loader2, Newspaper, RefreshCw, Rss } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { RssTabs } from "../RssTabs";
import { FilterBar } from "./FilterBar";
import { FeedItemCard } from "./FeedItemCard";
import { useRssFeeds } from "../../hooks/useRssFeeds";
import { useFeedViewer } from "../../hooks/useFeedViewer";

function ItemSkeletons() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="flex gap-4 p-4">
            <Skeleton className="hidden h-20 w-28 shrink-0 rounded-lg sm:block" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RssViewerPage() {
  const { feeds, loading: feedsLoading } = useRssFeeds();
  const {
    filters,
    setFilter,
    filteredItems,
    loading,
    refreshing,
    error,
    availableCategories,
    refreshAll,
  } = useFeedViewer(feeds);

  const hasFeeds = (feeds?.length ?? 0) > 0;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <RssTabs />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RSS Viewer</h1>
          <p className="text-sm text-muted-foreground">
            Browse the latest posts from your configured channels.
          </p>
        </div>
        <Button variant="outline" onClick={refreshAll} disabled={refreshing || !hasFeeds || feedsLoading}>
          {refreshing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          Refresh
        </Button>
      </div>

      {feedsLoading ? (
        <ItemSkeletons />
      ) : !hasFeeds ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Rss className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold">No feeds yet</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Head to the Manager to add a provider, then come back here to browse its articles.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/tools/rss/manager">Open Manager</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <FilterBar
            feeds={feeds ?? []}
            filters={filters}
            availableCategories={availableCategories}
            onFilterChange={setFilter}
          />

          {error && (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
            </Card>
          )}

          {loading ? (
            <ItemSkeletons />
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Newspaper className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">No articles match</h2>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {feeds && feeds.length > 0 && filters.search
                      ? "Try a different search term or widen the time range."
                      : "Your channels have no posts for the current filters."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {filteredItems.length} {filteredItems.length === 1 ? "article" : "articles"}
              </p>
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <FeedItemCard key={`${item.feedId}-${item.guid}`} item={item} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
