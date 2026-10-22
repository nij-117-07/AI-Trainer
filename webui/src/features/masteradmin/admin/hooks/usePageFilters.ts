// src/features/admin/hooks/usePageFilters.ts
/**
 * Custom hook for filtering and sorting the pages list.
 * Handles search queries, category filtering, and alphabetical sorting.
 */

import { useMemo } from "react";
import { Page } from "@/features/pages/types/page";

interface UsePageFiltersProps {
  pages: Page[];
  searchQuery: string;
  selectedCategory: string;
}

export function usePageFilters({ 
  pages, 
  searchQuery, 
  selectedCategory 
}: UsePageFiltersProps) {
  return useMemo(() => {
    return pages
      .filter((page) => {
        const matchesSearch = 
          page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesCategory = 
          selectedCategory === "all" || page.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [pages, searchQuery, selectedCategory]);
}