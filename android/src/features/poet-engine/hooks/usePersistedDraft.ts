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
import type { ConceptResult } from "../types";

export function usePersistedForm<TForm extends object>(defaults: TForm) {
  const [form, setForm] = useState<TForm>(defaults);
  const [loaded, setLoaded] = useState(false);

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
    saveDocument(POET_ENGINE_FORM_KEY, form).catch(() => undefined);
  }, [loaded, form]);

  const reset = useCallback(() => {
    setForm(defaults);
  }, [defaults]);

  return { form, setForm, reset };
}

export function usePersistedResult(): ConceptResult | null {
  const [result, setResult] = useState<ConceptResult | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(POET_ENGINE_RESULT_KEY, null)
        .then((saved) => {
          if (active)
            setResult(
              isRecord(saved) ? (saved as unknown as ConceptResult) : null,
            );
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  return result;
}
