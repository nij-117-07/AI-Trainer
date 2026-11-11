// src/features/what-to-do-now/hooks/useSavedDraft.ts
/**
 * Keeps the form and the last result on the device, so both survive an app restart. Matches the
 * webui draft behaviour: restore after mount, save shortly after each change, and reset to defaults.
 */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";

const SAVE_DELAY_MS = 300;

export function useSavedDraft<TForm, TResult>(
  storageKey: string,
  defaults: TForm,
  parse: (raw: unknown) => { form: TForm; result: TResult | null },
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

  const persist = useCallback(
    (nextForm: TForm, nextResult: TResult | null) =>
      saveDocument(storageKey, { form: nextForm, result: nextResult, savedAt: new Date().toISOString() }).catch(() => undefined),
    [storageKey],
  );

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      void persist(form, result);
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready, persist, form, result]);

  const saveResultNow = useCallback(
    (nextResult: TResult) => {
      setResult(nextResult);
      if (ready) void persist(form, nextResult);
    },
    [ready, persist, form],
  );

  const reset = useCallback(() => {
    setForm(defaults);
    setResult(null);
  }, [defaults]);

  return { form, setForm, result, setResult, saveResultNow, reset };
}
