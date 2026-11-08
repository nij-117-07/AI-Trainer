// src/features/charts/hooks/usePersistedChart.ts
/** Keeps the Chart.js Generator form draft and last result on the device between visits. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { isRecord } from "../lib/text";
import { mergeSavedForm, type SavedChartState } from "../lib/persistence";

export function usePersistedChart<TForm extends object, TResult>(storageKey: string, defaults: TForm) {
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
    const state: SavedChartState<TForm, TResult> = { form, result };
    saveDocument(storageKey, state).catch(() => undefined);
  }, [loaded, storageKey, form, result]);

  const reset = useCallback(() => {
    setForm(defaults);
    setResult(null);
  }, [defaults]);

  return { form, setForm, result, setResult, reset };
}
