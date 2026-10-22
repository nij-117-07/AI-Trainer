// src/features/tools/rss/components/manager/FeedCard.tsx
/**
 * Single feed provider row for the Manager. Shows identity, category badge,
 * refresh interval, enable switch, and edit/delete/refresh actions. Delete is
 * gated behind a confirmation AlertDialog.
 */
"use client";

import { useState } from "react";
import { Loader2, Pencil, RefreshCw, Trash2, Globe } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { refreshFeedAction } from "../../actions/fetch";
import type { RssFeedConfig } from "../../types";
import { formatRelativeTime } from "../../lib/format";

interface FeedCardProps {
  feed: RssFeedConfig;
  busy: boolean;
  onEdit: (feed: RssFeedConfig) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
}

export function FeedCard({ feed, busy, onEdit, onDelete, onToggleEnabled }: FeedCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [fetching, setFetching] = useState(false);

  const runFetch = async () => {
    setFetching(true);
    try {
      const result = await refreshFeedAction(feed.id);
      toast.success(`Fetched ${result.items.length} items`, {
        description: result.source.title || feed.name,
      });
    } catch (error) {
      toast.error("Fetch failed", {
        description: error instanceof Error ? error.message : "Could not fetch the feed.",
      });
    } finally {
      setFetching(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold">{feed.name}</h3>
              <Badge variant="secondary">{feed.category}</Badge>
              {!feed.enabled && <Badge variant="outline">Disabled</Badge>}
            </div>
            <a
              href={feed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Globe className="h-3 w-3 shrink-0" />
              <span className="truncate">{feed.url}</span>
            </a>
            <p className="mt-1 text-xs text-muted-foreground">
              Every {feed.refreshIntervalMinutes}m · updated {formatRelativeTime(feed.updatedAt)}
            </p>
          </div>

          <Switch
            checked={feed.enabled}
            onCheckedChange={(enabled) => onToggleEnabled(feed.id, enabled)}
            disabled={busy}
            aria-label={`Toggle ${feed.name}`}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
          <Button variant="ghost" size="sm" onClick={runFetch} disabled={busy || fetching}>
            {fetching ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            Fetch
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(feed)} disabled={busy} aria-label={`Edit ${feed.name}`}>
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
              aria-label={`Delete ${feed.name}`}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </CardContent>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{feed.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the provider and its cached items. Existing posts in the viewer
              disappear on the next refresh. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onDelete(feed.id);
                setConfirmDelete(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
