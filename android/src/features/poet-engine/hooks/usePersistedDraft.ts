// src/features/poet-engine/hooks/usePersistedDraft.ts
/** Keeps the Poet Engine form on the device, and the last explanation for the page to reload on focus. */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { isRecord } from "../lib/text";
import {
  POET_ENGINE_FORM_KEY,
  POET_ENGINE_RESULT_KEY,
  mergeSavedForm,
} from "../lib/persistence";
import { unsavedResult } from "../lib/result-store";
import type { ConceptResult } from "../types";

export function usePersistedForm<TForm extends object>(defaults: TForm) {
  const [form, setForm] = useState<TForm>(defaults);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(POET_ENGINE_FORM_KEY, null)
      .then((saved) => {
        if (active) setForm(mergeSavedForm(defaults, saved));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [defaults]);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(POET_ENGINE_FORM_KEY, form).then(
      () => setSaveError(false),
      () => setSaveError(true),
    );
  }, [loaded, form]);

  const reset = useCallback(() => {
    setForm(defaults);
  }, [defaults]);

  return { form, setForm, reset, saveError };
}

export function usePersistedResult(): { result: ConceptResult | null; saveFailed: boolean } {
  const [result, setResult] = useState<ConceptResult | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const unsaved = unsavedResult(POET_ENGINE_RESULT_KEY);
      if (unsaved) {
        setResult(unsaved.value as ConceptResult);
        setSaveFailed(unsaved.failed);
      } else {
        loadDocument<unknown>(POET_ENGINE_RESULT_KEY, null)
          .then((saved) => {
            if (!active) return;
            setResult(isRecord(saved) ? (saved as unknown as ConceptResult) : null);
            setSaveFailed(false);
          })
          .catch(() => undefined);
      }
      return () => {
        active = false;
      };
    }, []),
  );

  return { result, saveFailed };
}
