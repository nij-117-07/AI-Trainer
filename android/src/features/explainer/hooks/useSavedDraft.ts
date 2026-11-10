// src/features/explainer/hooks/useSavedDraft.ts
/**
 * Keeps the form and the last result on the device, so both survive an app restart. Restores after
 * mount, saves shortly after each change, and resets to defaults.
 */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { ToolDraft } from "../lib/drafts";

const SAVE_DELAY_MS = 300;

export function useSavedDraft<TForm, TResult>(
  storageKey: string,
  defaults: TForm,
  parse: (raw: unknown) => ToolDraft<TForm, TResult>,
) {
  const [form, setForm] = useState<TForm>(defaults);
  const [result, setResult] = useState<TResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(storageKey, null)
      .then((raw) => {
        if (!active || raw === null) return;
        const draft = parse(raw);
        setForm(draft.form);
        setResult(draft.result);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [storageKey, parse]);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      saveDocument(storageKey, { form, result, savedAt: new Date().toISOString() }).catch(() => undefined);
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready, storageKey, form, result]);

  const reset = useCallback(() => {
    setForm(defaults);
    setResult(null);
  }, [defaults]);

  return { form, setForm, result, setResult, reset };
}
