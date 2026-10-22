// src/features/tools/rss/components/manager/RssManagerPage.tsx
/**
 * RSS Feed Manager page. Lists every configured feed provider with fetch,
 * enable/disable, edit, and delete actions, plus an add dialog. Loads the
 * feed list via useRssFeeds and shows skeletons while reading the server
 * JSON store.
 */
"use client";

import { useState } from "react";
import { Plus, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { RssTabs } from "../RssTabs";
import { FeedCard } from "./FeedCard";
import { FeedFormDialog } from "./FeedFormDialog";
import { useRssFeeds } from "../../hooks/useRssFeeds";
import type { RssFeedConfig, RssFeedInput } from "../../types";

function FeedSkeletons() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-7 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RssManagerPage() {
  const { feeds, loading, busyId, createFeed, updateFeed, deleteFeed } = useRssFeeds();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingFeed, setEditingFeed] = useState<RssFeedConfig | undefined>(undefined);

  const openCreate = () => {
    setMode("create");
    setEditingFeed(undefined);
    setDialogOpen(true);
  };

  const openEdit = (feed: RssFeedConfig) => {
    setMode("edit");
    setEditingFeed(feed);
    setDialogOpen(true);
  };

  const handleSave = async (input: RssFeedInput) => {
    if (mode === "edit" && editingFeed) {
      const updated = await updateFeed(editingFeed.id, input);
      if (updated) setDialogOpen(false);
    } else {
      const created = await createFeed(input);
      if (created) setDialogOpen(false);
    }
  };

  const handleToggleEnabled = (id: string, enabled: boolean) => {
    void updateFeed(id, { enabled });
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <RssTabs />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RSS Feed Manager</h1>
          <p className="text-sm text-muted-foreground">
            Configure the RSS and Atom providers that power the viewer.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Add feed
        </Button>
      </div>

      {loading ? (
        <FeedSkeletons />
      ) : !feeds || feeds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Rss className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-semibold">No feeds configured yet</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Add your first provider — a blog, news site, or any RSS/Atom feed — to start
                curating content.
              </p>
            </div>
            <Button onClick={openCreate} variant="outline">
              <Plus />
              Add your first feed
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {feeds.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              busy={busyId === feed.id}
              onEdit={openEdit}
              onDelete={(id) => void deleteFeed(id)}
              onToggleEnabled={handleToggleEnabled}
            />
          ))}
        </div>
      )}

      <FeedFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={mode}
        feed={editingFeed}
        busy={busyId === editingFeed?.id || busyId === "new"}
        onSave={handleSave}
      />
    </div>
  );
}
