// src/features/admin/components/AdminContainer.tsx
/**
 * Admin container managing the list view with filtering and sorting capabilities.
 * Orchestrates data fetching, search state, and management dialogs.
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Page } from "@/features/pages/types/page";
import { PageAdminList } from "./PageAdminList";
import { PageDialog } from "./PageDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, RefreshCw, Search, FilterX } from "lucide-react";
import { createPage, updatePage, deletePage, PageFormData, getPages } from "../actions/page-actions";
import { usePageFilters } from "../hooks/usePageFilters";

export function AdminContainer() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const loadPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPages();
      setPages(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadPages(); }, [loadPages]);

  // Derived Values
  const categories = useMemo(() => 
    ["all", ...new Set(pages.map(p => p.category))], 
    [pages]
  );

  const filteredPages = usePageFilters({ 
    pages, 
    searchQuery, 
    selectedCategory: categoryFilter 
  });

  const handleAction = async (action: (data: PageFormData) => Promise<any>, data: PageFormData) => {
    const result = await action(data);
    if (result.success) await loadPages();
    return result;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadPages} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => { setEditingPage(null); setDialogOpen(true); }} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" /> Add Page
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title, description or tags..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat === 'all' ? 'All Categories' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="ghost" 
          onClick={() => { setSearchQuery(""); setCategoryFilter("all"); }}
          className="text-muted-foreground gap-2"
        >
          <FilterX className="h-4 w-4" /> Reset
        </Button>
      </div>

      <PageAdminList
        pages={filteredPages}
        onEdit={(p) => { setEditingPage(p); setDialogOpen(true); }}
        onDelete={async (id) => { 
          setDeletingId(id); 
          await deletePage(id); 
          setPages(prev => prev.filter(p => p.id !== id));
          setDeletingId(null);
        }}
        isDeleting={deletingId}
      />

      <PageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        page={editingPage}
        onSubmit={(data) => handleAction(editingPage ? updatePage : createPage, data)}
        mode={editingPage ? "edit" : "create"}
      />
    </div>
  );
}