// src/features/word-of-the-day/hooks/usePersistedDraft.ts
/** Keeps the Word of the Day form draft and the last word on the device between visits. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { isRecord } from "../lib/text";
import { mergeSavedForm, type SavedWordOfTheDayState } from "../lib/persistence";

export function usePersistedDraft<TForm extends object, TResult>(storageKey: string, defaults: TForm) {
  const [form, setForm] = useState<TForm>(defaults);
  const [result, setResult] = useState<TResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(storageKey, null)
      .then((saved) => {
        if (!active) return;
        if (isRecord(saved)) {
          setForm(mergeSavedForm(defaults, saved.form));
          setResult(isRecord(saved.result) ? (saved.result as TResult) : null);
        }
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
    const state: SavedWordOfTheDayState<TForm, TResult> = { form, result };
    saveDocument(storageKey, state).catch(() => undefined);
  }, [loaded, storageKey, form, result]);

  const reset = useCallback(() => {
    setForm(defaults);
    setResult(null);
  }, [defaults]);

  return { form, setForm, result, setResult, reset };
}
