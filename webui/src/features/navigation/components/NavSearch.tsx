// src/features/navigation/components/NavSearch.tsx
/**
 * Command-palette style search dialog for navigating pages.
 * Opens with Cmd+K, filters navigation tree by title/description.
 */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Command, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { NavigationNode } from "../types";

interface NavSearchProps {
  rootNode: NavigationNode;
}

function flattenTree(node: NavigationNode): { title: string; href: string; description: string }[] {
  const result: { title: string; href: string; description: string }[] = [];
  if (node.href !== "/") {
    result.push({ title: node.title, href: node.href, description: node.description });
  }
  for (const child of node.children) {
    result.push(...flattenTree(child));
  }
  return result;
}

export function NavSearch({ rootNode }: NavSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const pages = useMemo(() => flattenTree(rootNode), [rootNode]);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return pages.filter(
      (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }, [query, pages]);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        className="relative h-10 w-full max-w-[200px] justify-start rounded-lg border border-border/50 bg-muted/50 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:max-w-[260px]"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Search pages...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <Command className="h-3 w-3" />K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[15%] max-w-lg -translate-y-0 sm:max-w-xl" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>Search pages</DialogTitle>
          </DialogHeader>
          <div className="flex items-center border-b pb-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              autoFocus
            />
          </div>
          {filtered.length > 0 && (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-1">
                {filtered.map((page) => (
                  <button
                    key={page.href}
                    onClick={() => handleSelect(page.href)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">{page.title}</span>
                      {page.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {page.description}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
          {query && filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </p>
          )}
          <div className="border-t pt-2 text-xs text-muted-foreground">
            <kbd className="rounded border px-1 py-0.5 font-mono text-[10px]">ESC</kbd> to close
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
