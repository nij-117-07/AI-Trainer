// src/features/social-posts/hooks/usePersistedDraft.ts
/** Keeps the post form on the device, and the result tree for the result pages to reload on focus. */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { restoreSocialPostResult } from "../lib/normalize";
import { mergeSavedForm, SOCIAL_POSTS_DEFAULTS, SOCIAL_POSTS_FORM_KEY, SOCIAL_POSTS_RESULT_KEY } from "../lib/persistence";
import type { SocialPostFormValues, SocialPostResult } from "../types";

export function usePersistedForm() {
  const [form, setForm] = useState<SocialPostFormValues>(SOCIAL_POSTS_DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(SOCIAL_POSTS_FORM_KEY, null)
      .then((saved) => {
        if (active) setForm(mergeSavedForm(SOCIAL_POSTS_DEFAULTS, saved));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(SOCIAL_POSTS_FORM_KEY, form).catch(() => undefined);
  }, [loaded, form]);

  const reset = useCallback(() => {
    setForm(SOCIAL_POSTS_DEFAULTS);
  }, []);

  return { form, setForm, reset };
}

/** Reads the saved result tree now. Use it right before a write, so the write builds on the latest data. */
export async function loadSocialPostsResult(): Promise<SocialPostResult | null> {
  return restoreSocialPostResult(await loadDocument<unknown>(SOCIAL_POSTS_RESULT_KEY, null));
}

export function saveSocialPostsResult(result: SocialPostResult): Promise<void> {
  return saveDocument(SOCIAL_POSTS_RESULT_KEY, result);
}

export function usePersistedResult(): { result: SocialPostResult | null; loaded: boolean } {
  const [result, setResult] = useState<SocialPostResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadSocialPostsResult()
        .then((next) => {
          if (active) setResult(next);
        })
        .catch(() => undefined)
        .finally(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  return { result, loaded };
}
