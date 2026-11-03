// src/features/tools/web-search/components/SearchResultCard.tsx
/**
 * Card for one web search result, Google-style: favicon + host breadcrumb,
 * the page title as an external link, and the text snippet. Links open in a
 * new tab.
 */
"use client";

import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { WebSearchResult } from "../types";

interface SearchResultCardProps {
  result: WebSearchResult;
  rank: number;
}

/** Google Public Favicon service; free, no key needed. */
function faviconUrl(host: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`;
}

export function SearchResultCard({ result, rank }: SearchResultCardProps) {
  return (
    <Card className="transition-colors hover:border-foreground/20">
      <CardContent className="flex gap-3 p-4">
        <span className="mt-0.5 text-xs tabular-nums text-muted-foreground" aria-hidden>
          {rank}.
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={faviconUrl(result.host)}
              alt=""
              loading="lazy"
              className="size-4 shrink-0 rounded-sm border bg-muted"
            />
            <span className="truncate text-xs text-muted-foreground">{result.host}</span>
          </div>

          <h3 className="mt-1 text-base font-semibold leading-snug">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 transition-colors hover:underline"
            >
              {result.title}
            </a>
          </h3>

          {result.snippet && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{result.snippet}</p>
          )}

          <p className="mt-1.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <ExternalLink className="h-3 w-3 shrink-0" />
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate underline-offset-2 hover:underline"
            >
              {result.url}
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
