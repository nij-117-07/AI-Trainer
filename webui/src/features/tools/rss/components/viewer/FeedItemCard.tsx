// src/features/tools/rss/components/viewer/FeedItemCard.tsx
/**
 * Card for a single RSS item in the Viewer list. Renders an optional media
 * thumbnail, source/author/date metadata, the title as an external link, a
 * description snippet, and category tags.
 */
"use client";

import { ExternalLink, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { RssFeedItem } from "../../types";
import { formatRelativeTime, truncate } from "../../lib/format";

interface FeedItemCardProps {
  item: RssFeedItem;
}

export function FeedItemCard({ item }: FeedItemCardProps) {
  const link = item.link || "#";
  return (
    <Card className="transition-colors hover:border-foreground/20">
      <CardContent className="flex gap-4 p-4">
        {item.media?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.media.url}
            alt=""
            loading="lazy"
            className="hidden h-20 w-28 shrink-0 rounded-lg border object-cover sm:block"
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{item.feedName || "Feed"}</span>
            {item.author && <span>· {item.author}</span>}
            {item.pubDate && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(item.pubDate)}
              </span>
            )}
          </div>

          <h3 className="mt-1 text-sm font-semibold leading-snug">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-2 transition-colors hover:text-primary"
            >
              {item.title}
            </a>
          </h3>

          {item.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {truncate(item.description, 220)}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {item.categories.slice(0, 4).map((category) => (
              <Badge key={category} variant="outline" className="text-[10px]">
                {category}
              </Badge>
            ))}
            {link !== "#" && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3" />
                Read more
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
