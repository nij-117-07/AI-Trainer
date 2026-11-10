/** Feed form state for the add and edit pages: the fields, validation, testing a URL, and saving. */
import { useState } from "react";
import { messageOf } from "../lib/errors";
import { fetchFeed } from "../lib/fetch-feed";
import { createFeed, updateFeed } from "../lib/store";
import { isHttpUrl, validateFeedInput, type FeedInputErrors } from "../lib/validation";
import { DEFAULT_REFRESH_MINUTES } from "../options";
import type { RssFeedConfig } from "../types";

export interface FeedDraft {
  name: string;
  url: string;
  category: string;
  intervalValue: string;
  enabled: boolean;
}

interface Preview {
  title: string;
  itemCount: number;
}

export type FeedFormState = ReturnType<typeof useFeedForm>;

function draftFrom(feed: RssFeedConfig | null): FeedDraft {
  if (!feed) {
    return { name: "", url: "", category: "", intervalValue: String(DEFAULT_REFRESH_MINUTES), enabled: true };
  }
  return {
    name: feed.name,
    url: feed.url,
    category: feed.category,
    intervalValue: String(feed.refreshIntervalMinutes),
    enabled: feed.enabled,
  };
}

/** `feed` is the saved provider being edited, or null for a new one. */
export function useFeedForm(feed: RssFeedConfig | null, onSaved: () => void) {
  const [draft, setDraft] = useState<FeedDraft>(() => draftFrom(feed));
  const [errors, setErrors] = useState<FeedInputErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);

  function update<K extends keyof FeedDraft>(key: K, value: FeedDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (key === "url") {
      setPreview(null);
      setTestError(null);
    }
  }

  function reset() {
    setDraft(draftFrom(null));
    setErrors({});
    setSaveError(null);
    setPreview(null);
    setTestError(null);
  }

  async function test() {
    const target = draft.url.trim();
    setPreview(null);
    setTestError(null);
    if (!isHttpUrl(target)) {
      setTestError("Enter a valid URL to test.");
      return;
    }
    setTesting(true);
    try {
      const result = await fetchFeed(
        { id: "preview", name: "Preview", url: target, refreshIntervalMinutes: DEFAULT_REFRESH_MINUTES },
        { bypassCache: true, persist: false },
      );
      setPreview({ title: result.source.title || "Untitled feed", itemCount: result.items.length });
    } catch (cause) {
      setTestError(messageOf(cause, "Could not fetch the feed."));
    } finally {
      setTesting(false);
    }
  }

  async function save() {
    const checked = validateFeedInput({
      name: draft.name,
      url: draft.url,
      category: draft.category,
      enabled: draft.enabled,
      refreshIntervalMinutes: Number(draft.intervalValue),
    });
    if (!checked.ok) {
      setErrors(checked.errors);
      return;
    }
    setErrors({});
    setSaveError(null);
    setPending(true);
    try {
      if (feed) {
        await updateFeed(feed.id, checked.value);
      } else {
        await createFeed(checked.value);
      }
      onSaved();
    } catch (cause) {
      setSaveError(messageOf(cause, "Could not save the feed."));
    } finally {
      setPending(false);
    }
  }

  return {
    editing: feed !== null,
    draft,
    errors,
    saveError,
    pending,
    testing,
    testError,
    preview,
    update,
    reset,
    test,
    save,
  };
}
