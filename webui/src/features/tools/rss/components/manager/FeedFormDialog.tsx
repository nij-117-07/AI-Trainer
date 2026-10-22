// src/features/tools/rss/components/manager/FeedFormDialog.tsx
/**
 * Add/Edit dialog for an RSS feed provider. Uses react-hook-form + Zod for
 * validation, a "Test feed" button that previews a candidate URL via the
 * fetchFeedUrlAction server action, and a Switch for enabling the feed.
 */
"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2, PlugZap } from "lucide-react";
import { toast } from "sonner";
import { zodResolver } from "@/lib/zod-resolver";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchFeedUrlAction } from "../../actions/fetch";
import { RssFeedInputSchema, type RssFeedConfig, type RssFeedInput } from "../../types";

const REFRESH_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 360, label: "6 hours" },
  { value: 720, label: "12 hours" },
  { value: 1440, label: "24 hours" },
] as const;

interface FeedFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  feed?: RssFeedConfig;
  busy: boolean;
  onSave: (input: RssFeedInput) => Promise<void>;
}

interface PreviewState {
  title: string;
  itemCount: number;
}

export function FeedFormDialog({ open, onOpenChange, mode, feed, busy, onSave }: FeedFormDialogProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RssFeedInput>({
    resolver: zodResolver(RssFeedInputSchema),
    defaultValues: {
      name: "",
      url: "",
      category: "General",
      enabled: true,
      refreshIntervalMinutes: 60,
    },
  });

  const [testing, setTesting] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  useEffect(() => {
    if (!open) return;
    reset(
      feed
        ? {
            name: feed.name,
            url: feed.url,
            category: feed.category,
            enabled: feed.enabled,
            refreshIntervalMinutes: feed.refreshIntervalMinutes,
          }
        : {
            name: "",
            url: "",
            category: "General",
            enabled: true,
            refreshIntervalMinutes: 60,
          }
    );
  }, [open, feed, reset]);

  const handleOpenChange = (next: boolean) => {
    setPreview(null);
    onOpenChange(next);
  };

  const runTestFetch = async () => {
    const url = (document.getElementById("rss-feed-url") as HTMLInputElement | null)?.value;
    if (!url) {
      toast.error("Enter a feed URL to test.");
      return;
    }
    setTesting(true);
    setPreview(null);
    try {
      const result = await fetchFeedUrlAction(url);
      setPreview({
        title: result.source.title || "Untitled feed",
        itemCount: result.items.length,
      });
    } catch (error) {
      toast.error("Test failed", {
        description: error instanceof Error ? error.message : "Could not fetch the feed.",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add feed provider" : "Edit feed provider"}</DialogTitle>
          <DialogDescription>
            Configure an RSS or Atom source. Test it before saving to confirm it parses correctly.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(async (values) => {
            await onSave(values);
          })}
          className="grid gap-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="rss-feed-name">Name</Label>
            <Input
              id="rss-feed-name"
              placeholder="e.g. Hacker News"
              aria-invalid={!!errors.name}
              disabled={busy}
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rss-feed-url">Feed URL</Label>
            <Input
              id="rss-feed-url"
              type="url"
              placeholder="https://news.ycombinator.com/rss"
              aria-invalid={!!errors.url}
              disabled={busy}
              {...register("url")}
            />
            {errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={runTestFetch} disabled={testing || busy}>
                {testing ? <Loader2 className="animate-spin" /> : <PlugZap />}
                Test feed
              </Button>
              {preview && (
                <p className="text-sm text-muted-foreground">
                  {preview.title} · {preview.itemCount} items
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rss-feed-category">Category</Label>
            <Input
              id="rss-feed-category"
              placeholder="e.g. Tech"
              aria-invalid={!!errors.category}
              disabled={busy}
              {...register("category")}
            />
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label>Refresh interval</Label>
            <Select
              defaultValue="60"
              disabled={busy}
              onValueChange={(value) => setValue("refreshIntervalMinutes", Number(value))}
            >
              <SelectTrigger className="w-full" id="rss-feed-interval">
                <SelectValue placeholder="Select an interval" />
              </SelectTrigger>
              <SelectContent>
                {REFRESH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="rss-feed-enabled" className="font-medium">Enabled</Label>
              <p className="text-sm text-muted-foreground">Disabled feeds are hidden from the viewer.</p>
            </div>
            <Controller
              control={control}
              name="enabled"
              render={({ field }) => (
                <Switch
                  id="rss-feed-enabled"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={busy}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || testing}>
              {busy && <Loader2 className="animate-spin" />}
              {mode === "create" ? "Add feed" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
