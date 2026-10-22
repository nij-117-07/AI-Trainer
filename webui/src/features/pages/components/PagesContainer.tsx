"use client";

import { usePageSearch } from "../hooks/usePageSearch";
import { PageSearchFilters } from "./PageSearchFilters";
import { PageCard } from "./PageCard";
import { RecentlyViewed } from "./RecentlyViewed";
import { EmptyState } from "./EmptyState";
import { Page } from "../types/page";

interface PagesContainerProps {
  initialPages: Page[];
}

export function PagesContainer({ initialPages }: PagesContainerProps) {
  const {
    filteredPages,
    searchQuery,
    selectedCategory,
    sortMode,
    isPending,
    categories,
    categoryCounts,
    recentlyViewed,
    setSearchQuery,
    setSelectedCategory,
    setSortMode,
    resetFilters,
    reshuffle,
    trackPageVisit,
  } = usePageSearch({ pages: initialPages });

  return (
    <div className="space-y-6">
      <PageSearchFilters
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        sortMode={sortMode}
        categories={categories}
        categoryCounts={categoryCounts}
        isPending={isPending}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onSortModeChange={setSortMode}
        onReset={resetFilters}
        onReshuffle={reshuffle}
        resultsCount={filteredPages.length}
      />

      <RecentlyViewed pages={recentlyViewed} onVisit={trackPageVisit} />

      {filteredPages.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredPages.map((page) => (
            <PageCard key={page.id} page={page} onVisit={trackPageVisit} />
          ))}
        </div>
      )}
    </div>
  );
}
