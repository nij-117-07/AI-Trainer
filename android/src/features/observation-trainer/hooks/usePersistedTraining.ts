// src/features/observation-trainer/hooks/usePersistedTraining.ts
/** Keeps the Observation Trainer form and last report on the device between visits. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { DEFAULT_OBSERVATION_FORM } from "../options";
import { OBSERVATION_SESSION_KEY, parseSavedSession } from "../lib/persistence";
import type { ObservationFormValues, ObservationTrainResult } from "../types";

export function usePersistedTraining() {
  const [form, setForm] = useState<ObservationFormValues>(DEFAULT_OBSERVATION_FORM);
  const [result, setResult] = useState<ObservationTrainResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(OBSERVATION_SESSION_KEY, null)
      .then((saved) => {
        if (!active) return;
        const session = parseSavedSession(saved);
        setForm(session.form);
        setResult(session.result);
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
    saveDocument(OBSERVATION_SESSION_KEY, { form, result }).catch(() => undefined);
  }, [loaded, form, result]);

  const reset = useCallback(() => {
    setForm(DEFAULT_OBSERVATION_FORM);
    setResult(null);
  }, []);

  return { form, setForm, result, setResult, reset };
}
