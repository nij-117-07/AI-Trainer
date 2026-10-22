"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { Page } from "../types/page";
import { PageCard } from "./PageCard";

interface RecentlyViewedProps {
  pages: Page[];
  onVisit: (page: Page) => void;
}

export function RecentlyViewed({ pages, onVisit }: RecentlyViewedProps) {
  if (pages.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span>Recently viewed</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {pages.map((page) => (
          <div key={page.id} className="min-w-[200px] max-w-[220px] shrink-0">
            <PageCard page={page} onVisit={onVisit} />
          </div>
        ))}
      </div>
    </div>
  );
}
