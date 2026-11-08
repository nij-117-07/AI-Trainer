// src/features/motivation/hooks/useDraft.ts
/**
 * Keeps one tool's form and last result on the device, under a versioned document key. Restore
 * rules come from lib/drafts.ts, so an unreadable draft falls back to the defaults.
 */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { Draft } from "../lib/drafts";

export function useDraft<TForm, TResult>(
  key: string,
  defaults: TForm,
  restore: (raw: unknown) => Draft<TForm, TResult>,
) {
  const [form, setForm] = useState<TForm>(defaults);
  const [result, setResult] = useState<TResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(key, null)
      .then((raw) => {
        if (!active) return;
        if (raw !== null) {
          const restored = restore(raw);
          setForm(restored.form);
          setResult(restored.result);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [key, restore]);

  useEffect(() => {
    if (!ready) return;
    saveDocument(key, { form, result, savedAt: new Date().toISOString() }).catch(() => undefined);
  }, [key, ready, form, result]);

  const reset = useCallback(() => {
    setForm(defaults);
    setResult(null);
  }, [defaults]);

  return { form, setForm, result, setResult, reset };
}
