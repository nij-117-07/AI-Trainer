// src/features/tools/rss/components/viewer/FilterBar.tsx
/**
 * Responsive filter bar for the RSS Viewer: channel selector, category
 * selector, free-text search, and a time-range selector. Pure presentational
 * component driven by the useFeedViewer hook.
 */
"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RssFeedConfig, RssTimeRange, RssViewerFilters } from "../../types";
import { RSS_TIME_RANGES } from "../../types";

const TIME_RANGE_LABELS: Record<RssTimeRange, string> = {
  all: "All time",
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

interface FilterBarProps {
  feeds: RssFeedConfig[];
  filters: RssViewerFilters;
  availableCategories: string[];
  onFilterChange: <K extends keyof RssViewerFilters>(key: K, value: RssViewerFilters[K]) => void;
}

export function FilterBar({ feeds, filters, availableCategories, onFilterChange }: FilterBarProps) {
  return (
    <div className="grid gap-3 rounded-xl border bg-muted/30 p-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="grid gap-1.5">
        <Label htmlFor="rss-channel">Channel</Label>
        <Select
          value={filters.feedId}
          onValueChange={(value) => onFilterChange("feedId", value)}
        >
          <SelectTrigger id="rss-channel" className="w-full">
            <SelectValue placeholder="All channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            {feeds.map((feed) => (
              <SelectItem key={feed.id} value={feed.id}>
                {feed.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="rss-category">Category</Label>
        <Select
          value={filters.category}
          onValueChange={(value) => onFilterChange("category", value)}
        >
          <SelectTrigger id="rss-category" className="w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {availableCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="rss-search">Search</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="rss-search"
            placeholder="Search articles…"
            value={filters.search}
            onChange={(event) => onFilterChange("search", event.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="rss-time">Time range</Label>
        <Select
          value={filters.timeRange}
          onValueChange={(value) => onFilterChange("timeRange", value as RssTimeRange)}
        >
          <SelectTrigger id="rss-time" className="w-full">
            <SelectValue placeholder="All time" />
          </SelectTrigger>
          <SelectContent>
            {RSS_TIME_RANGES.map((range) => (
              <SelectItem key={range} value={range}>
                {TIME_RANGE_LABELS[range]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
