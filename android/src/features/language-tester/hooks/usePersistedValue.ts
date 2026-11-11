// src/features/language-tester/hooks/usePersistedValue.ts
/** Keeps Language Tester drafts and results on the device. Saving starts only after the saved value has loaded. */
import { useCallback, useEffect, useRef, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { mergeSavedForm } from "../lib/persistence";
import { isRecord } from "../lib/text";

export function usePersistedValue<T>(key: string, initial: T, restore: (saved: unknown) => T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const restoreRef = useRef(restore);
  restoreRef.current = restore;

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(key, null)
      .then((saved) => {
        if (active && saved !== null) setValue(restoreRef.current(saved));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(key, value).then(
      () => setSaveError(false),
      () => setSaveError(true),
    );
  }, [loaded, key, value]);

  return [value, setValue, saveError] as const;
}

interface SavedTool<TForm, TResult> {
  form: TForm;
  result: TResult | null;
}

/** One quiz tool's form draft and last generated result. */
export function usePersistedTool<TForm extends object, TResult>(key: string, defaults: TForm) {
  const [state, setState, saveError] = usePersistedValue<SavedTool<TForm, TResult>>(
    key,
    { form: defaults, result: null },
    (saved) => restoreTool<TForm, TResult>(defaults, saved),
  );

  const setForm = useCallback(
    (update: (prev: TForm) => TForm) => setState((prev) => ({ ...prev, form: update(prev.form) })),
    [setState],
  );
  const setResult = useCallback(
    (result: TResult | null) => setState((prev) => ({ ...prev, result })),
    [setState],
  );
  const reset = useCallback(() => setState({ form: defaults, result: null }), [defaults, setState]);

  return { form: state.form, setForm, result: state.result, setResult, reset, saveError };
}

function restoreTool<TForm extends object, TResult>(defaults: TForm, saved: unknown): SavedTool<TForm, TResult> {
  if (!isRecord(saved)) return { form: defaults, result: null };
  return {
    form: mergeSavedForm(defaults, saved.form),
    result: isRecord(saved.result) ? (saved.result as TResult) : null,
  };
}
