// src/features/social-posts/hooks/usePersistedDraft.ts
/** Keeps the tool's form draft and last result on the device between visits. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { mergeSavedForm, type SavedSocialPostsState } from "../lib/persistence";

export function usePersistedDraft<TForm extends object, TResult>(storageKey: string, defaults: TForm) {
  const [form, setForm] = useState<TForm>(defaults);
  const [result, setResult] = useState<TResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(storageKey, null)
      .then((saved) => {
        if (!active || typeof saved !== "object" || saved === null) return;
        const record = saved as { form?: unknown; result?: unknown };
        setForm(mergeSavedForm(defaults, record.form));
        setResult(typeof record.result === "object" && record.result !== null ? (record.result as TResult) : null);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [storageKey, defaults]);

  useEffect(() => {
    if (!loaded) return;
    const state: SavedSocialPostsState<TForm, TResult> = { form, result };
    saveDocument(storageKey, state).catch(() => undefined);
  }, [loaded, storageKey, form, result]);

  const reset = useCallback(() => {
    setForm(defaults);
    setResult(null);
  }, [defaults]);

  return { form, setForm, result, setResult, reset };
}
