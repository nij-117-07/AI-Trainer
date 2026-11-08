// src/features/translator/hooks/usePersistedTranslation.ts
/** Keeps the Translator draft and last translation on the device between visits. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { TRANSLATOR_DEFAULTS, TRANSLATOR_STORAGE_KEY } from "../options";
import { normalizeTranslation } from "../lib/normalize";
import type { TranslatorFormValues, TranslationResponse } from "../types";

type SavedState = { form: TranslatorFormValues; result: TranslationResponse | null };

const DEFAULTS: TranslatorFormValues = TRANSLATOR_DEFAULTS;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeForm(saved: unknown): TranslatorFormValues {
  if (!isRecord(saved)) return DEFAULTS;
  const merged = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS) as (keyof TranslatorFormValues)[]) {
    const value = saved[key];
    if (typeof value === typeof DEFAULTS[key]) merged[key] = value as string;
  }
  return merged;
}

export function usePersistedTranslation() {
  const [form, setForm] = useState<TranslatorFormValues>(DEFAULTS);
  const [result, setResult] = useState<TranslationResponse | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(TRANSLATOR_STORAGE_KEY, null)
      .then((saved) => {
        if (!active || !isRecord(saved)) return;
        setForm(mergeForm(saved.form));
        setResult(isRecord(saved.result) ? normalizeTranslation(saved.result) : null);
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
    const state: SavedState = { form, result };
    saveDocument(TRANSLATOR_STORAGE_KEY, state).catch(() => undefined);
  }, [loaded, form, result]);

  const reset = useCallback(() => {
    setForm(DEFAULTS);
    setResult(null);
  }, []);

  return { form, setForm, result, setResult, reset };
}
