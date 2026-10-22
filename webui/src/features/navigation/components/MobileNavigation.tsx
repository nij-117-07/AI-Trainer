// src/features/navigation/components/MobileNavigation.tsx
/**
 * Mobile navigation sheet with accordion drill-down, inline search,
 * and user identity section at the bottom.
 */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Menu, Search, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavigationNode, Identity } from "../types";
import { useActiveRoute } from "../hooks/useActiveRoute";

interface MobileNavItemProps {
  node: NavigationNode;
  onNavigate: () => void;
  searchQuery?: string;
}

function MobileNavItem({ node, onNavigate, searchQuery }: MobileNavItemProps) {
  const { isActive } = useActiveRoute();
  const matchesSearch = searchQuery
    ? node.title.toLowerCase().includes(searchQuery) ||
      node.description.toLowerCase().includes(searchQuery)
    : true;
  const hasChildren = node.children.length > 0;

  if (!matchesSearch) return null;

  if (!hasChildren) {
    return (
      <Link
        href={node.href}
        onClick={onNavigate}
        className={cn(
          "flex flex-col py-3 px-4 text-sm font-medium transition-colors border-b border-border/50 last:border-0",
          isActive(node.href)
            ? "bg-accent text-accent-foreground"
            : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
        )}
      >
        <span>{node.title}</span>
        {node.description && (
          <span className="text-xs text-muted-foreground mt-0.5">{node.description}</span>
        )}
      </Link>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full border-none">
      <AccordionItem value={node.id} className="border-b border-border/50">
        <AccordionTrigger className="py-3 px-4 hover:no-underline hover:bg-accent/50 [&[data-state=open]>svg]:rotate-180">
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{node.title}</span>
            {node.description && (
              <span className="text-xs text-muted-foreground font-normal">
                {node.description}
              </span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="pb-2">
            {node.children.map((child) => (
              <MobileNavItem
                key={child.id}
                node={child}
                onNavigate={onNavigate}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

interface MobileNavigationProps {
  rootNode: NavigationNode;
  identity?: Identity;
}

export function MobileNavigation({ rootNode, identity }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChildren = useMemo(() => {
    if (!searchQuery.trim()) return rootNode.children;
    const q = searchQuery.toLowerCase();
    const match = (node: NavigationNode): boolean =>
      node.title.toLowerCase().includes(q) ||
      node.description.toLowerCase().includes(q) ||
      node.children.some(match);
    return rootNode.children.filter(match);
  }, [searchQuery, rootNode]);

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearchQuery(""); }}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 rounded-full"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
        <SheetHeader className="px-4 pt-4 pb-0">
          <SheetTitle className="text-left flex items-center gap-2">
            <span className="text-primary font-bold">AI</span>
            <span>Studio</span>
          </SheetTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-0 py-2">
          {filteredChildren.map((node) => (
            <MobileNavItem
              key={node.id}
              node={node}
              onNavigate={() => setOpen(false)}
              searchQuery={searchQuery}
            />
          ))}
          {searchQuery && filteredChildren.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No pages match your search.
            </p>
          )}
        </ScrollArea>

        {identity && (
          <SheetFooter className="border-t px-4 py-3 mt-0">
            <div className="flex w-full items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                <span className="text-sm font-bold text-primary">
                  {identity.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">{identity.username}</span>
                {identity.email && (
                  <span className="text-xs text-muted-foreground truncate">{identity.email}</span>
                )}
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
