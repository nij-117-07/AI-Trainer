"use client";

import { Search, X, Shuffle, SortAsc } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SortMode } from "../hooks/usePageSearch";

interface PageSearchFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  sortMode: SortMode;
  categories: string[];
  categoryCounts: Record<string, number>;
  isPending: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortModeChange: (mode: SortMode) => void;
  onReset: () => void;
  onReshuffle: () => void;
  resultsCount: number;
}

export function PageSearchFilters({
  searchQuery,
  selectedCategory,
  sortMode,
  categories,
  categoryCounts,
  isPending,
  onSearchChange,
  onCategoryChange,
  onSortModeChange,
  onReset,
  onReshuffle,
  resultsCount,
}: PageSearchFiltersProps) {
  const hasFilters = searchQuery || selectedCategory !== "all" || sortMode !== "alpha";
  const isRandomMode = sortMode === "random";

  const displayCategories = categories.filter((c) => c !== "all");

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="overflow-x-auto scrollbar-thin -mx-1 px-1">
        <Tabs
          value={selectedCategory}
          onValueChange={onCategoryChange}
          className="w-full"
        >
          <TabsList className="h-auto w-full justify-start gap-1.5 bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="rounded-full px-3.5 py-1.5 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-slate-100 data-[state=inactive]:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              All <span className="ml-1 text-[10px] opacity-70">({categoryCounts.all})</span>
            </TabsTrigger>
            {displayCategories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-slate-100 data-[state=inactive]:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                {cat} <span className="ml-1 text-[10px] opacity-70">({categoryCounts[cat] || 0})</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Search + Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 w-full sm:w-auto flex-1 max-w-xl items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                "pl-9 bg-white border-slate-200 h-9 text-sm",
                isPending && "opacity-70"
              )}
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Tabs
              value={sortMode}
              onValueChange={(v) => onSortModeChange(v as SortMode)}
            >
              <TabsList className="h-9">
                <TabsTrigger value="alpha" className="gap-1.5 px-3 text-xs">
                  <SortAsc className="h-3.5 w-3.5" />
                  A-Z
                </TabsTrigger>
                <TabsTrigger value="random" className="gap-1.5 px-3 text-xs">
                  <Shuffle className="h-3.5 w-3.5" />
                  Random
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant="outline"
              size="icon"
              onClick={onReshuffle}
              disabled={!isRandomMode}
              aria-label="Reshuffle pages"
              className={cn(
                "h-9 w-9 transition-all duration-500",
                isRandomMode && "hover:rotate-180 hover:border-primary hover:text-primary",
                !isRandomMode && "opacity-50 cursor-not-allowed"
              )}
            >
              <Shuffle className="h-3.5 w-3.5" />
            </Button>

            {hasFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onReset}
                className="h-9 w-9 text-slate-500 hover:text-red-500"
                aria-label="Clear all filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full shrink-0">
          {resultsCount} result{resultsCount !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
