"use client";

import { useState, useMemo, useTransition, useCallback, useEffect } from "react";
import { Page } from "../types/page";

export type SortMode = "alpha" | "random";

interface UsePageSearchProps {
  pages: Page[];
}

interface UsePageSearchReturn {
  filteredPages: Page[];
  searchQuery: string;
  selectedCategory: string;
  sortMode: SortMode;
  isPending: boolean;
  categories: string[];
  categoryCounts: Record<string, number>;
  recentlyViewed: Page[];
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSortMode: (mode: SortMode) => void;
  resetFilters: () => void;
  reshuffle: () => void;
  trackPageVisit: (page: Page) => void;
}

const RECENT_KEY = "dashboard-recently-viewed";
const MAX_RECENT = 6;

const generateSeeds = (pages: Page[]): Record<string, number> => {
  const seeds: Record<string, number> = {};
  pages.forEach((p) => {
    seeds[p.id] = Math.random();
  });
  return seeds;
};

function loadRecentlyViewed(): Page[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentlyViewed(pages: Page[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(pages));
  } catch {}
}

export function usePageSearch({ pages }: UsePageSearchProps): UsePageSearchReturn {
  const safePages = pages || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("alpha");
  const [isPending, startTransition] = useTransition();
  const [randomSeeds, setRandomSeeds] = useState<Record<string, number>>(() =>
    generateSeeds(safePages)
  );
  const [recentlyViewed, setRecentlyViewed] = useState<Page[]>(loadRecentlyViewed);

  useEffect(() => {
    setRandomSeeds(generateSeeds(safePages));
  }, [safePages]);

  const categories = useMemo(() => {
    const cats = new Set(safePages.map((p) => p.category));
    return ["all", ...Array.from(cats).sort()];
  }, [safePages]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: safePages.length };
    safePages.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [safePages]);

  const filteredPages = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = safePages.filter((page) => {
      if (selectedCategory !== "all" && page.category !== selectedCategory) {
        return false;
      }
      if (query) {
        const inTitle = page.title.toLowerCase().includes(query);
        const inDesc = page.description.toLowerCase().includes(query);
        const inTags = page.tags.some((tag) => tag.toLowerCase().includes(query));
        return inTitle || inDesc || inTags;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === "alpha") {
        return a.title.localeCompare(b.title);
      }
      const seedA = randomSeeds[a.id] ?? Math.random();
      const seedB = randomSeeds[b.id] ?? Math.random();
      return seedA - seedB;
    });
  }, [safePages, searchQuery, selectedCategory, sortMode, randomSeeds]);

  const handleSearchChange = useCallback((query: string) => {
    startTransition(() => setSearchQuery(query));
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    startTransition(() => setSelectedCategory(category));
  }, []);

  const handleSortModeChange = useCallback((mode: SortMode) => {
    startTransition(() => setSortMode(mode));
  }, []);

  const resetFilters = useCallback(() => {
    startTransition(() => {
      setSearchQuery("");
      setSelectedCategory("all");
      setSortMode("alpha");
    });
  }, []);

  const reshuffle = useCallback(() => {
    if (sortMode === "random") {
      startTransition(() => setRandomSeeds(generateSeeds(safePages)));
    }
  }, [sortMode, safePages]);

  const trackPageVisit = useCallback((page: Page) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== page.id);
      const next = [page, ...filtered].slice(0, MAX_RECENT);
      saveRecentlyViewed(next);
      return next;
    });
  }, []);

  return {
    filteredPages,
    searchQuery,
    selectedCategory,
    sortMode,
    isPending,
    categories,
    categoryCounts,
    recentlyViewed,
    setSearchQuery: handleSearchChange,
    setSelectedCategory: handleCategoryChange,
    setSortMode: handleSortModeChange,
    resetFilters,
    reshuffle,
    trackPageVisit,
  };
}
