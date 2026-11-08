// src/features/lesson/hooks/usePersistedTool.ts
/** Keeps the Language Lesson form draft and the last lesson on the device between visits. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { isRecord } from "../lib/text";

function mergeSavedForm<T extends object>(defaults: T, saved: unknown): T {
  if (!isRecord(saved)) return defaults;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const value = saved[key];
    if (typeof value === typeof defaults[key]) merged[key] = value as T[typeof key];
  }
  return merged;
}

export function usePersistedTool<TForm extends object, TResult>(storageKey: string, defaults: TForm) {
  const [form, setForm] = useState<TForm>(defaults);
  const [result, setResult] = useState<TResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(storageKey, null)
      .then((saved) => {
        if (!active || !isRecord(saved)) return;
        setForm(mergeSavedForm(defaults, saved.form));
        setResult(isRecord(saved.result) ? (saved.result as TResult) : null);
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
    saveDocument(storageKey, { form, result }).catch(() => undefined);
  }, [loaded, storageKey, form, result]);

  const reset = useCallback(() => {
    setForm(defaults);
    setResult(null);
  }, [defaults]);

  return { form, setForm, result, setResult, reset };
}
