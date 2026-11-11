/**
 * Keeps the form and the last result on the device, so both survive an app restart. Text changes
 * are saved after a short delay. Result changes, such as ticking a project, are saved at once.
 * A failed save keeps the value in memory and sets saveFailed, so the screen can show a banner.
 */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";

const SAVE_DELAY_MS = 300;

export const SAVE_FAILED_MESSAGE = "Changes couldn't be saved. They'll try again.";

export function useSavedDraft<TForm, TResult>(
  storageKey: string,
  defaults: TForm,
  parse: (raw: unknown) => { form: TForm; result: TResult | null },
) {
  const [form, setForm] = useState<TForm>(defaults);
  const [result, setResult] = useState<TResult | null>(null);
  const [ready, setReady] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

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

  const save = useCallback(
    (nextForm: TForm, nextResult: TResult | null) => {
      saveDocument(storageKey, { form: nextForm, result: nextResult, savedAt: new Date().toISOString() })
        .then(() => setSaveFailed(false))
        .catch(() => setSaveFailed(true));
    },
    [storageKey],
  );

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => save(form, result), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [ready, form, result, save]);

  useEffect(() => {
    if (ready) save(form, result);
  }, [result]);

  const reset = useCallback(() => {
    setForm(defaults);
    setResult(null);
  }, [defaults]);

  return { form, setForm, result, setResult, reset, saveFailed };
}
