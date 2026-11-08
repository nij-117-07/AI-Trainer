// src/features/interview/hooks/useSetupDraft.ts
/** Keeps the interview setup form on the device between visits. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { DEFAULT_SETUP_FORM } from "../options";
import { INTERVIEW_KEYS, mergeSavedSetup } from "../lib/persistence";
import type { InterviewSetupForm } from "../types";

export function useSetupDraft() {
  const [form, setForm] = useState<InterviewSetupForm>(DEFAULT_SETUP_FORM);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(INTERVIEW_KEYS.setup, null)
      .then((saved) => {
        if (active) setForm(mergeSavedSetup(saved));
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
    saveDocument(INTERVIEW_KEYS.setup, form).catch(() => undefined);
  }, [loaded, form]);

  const updateField = useCallback(<K extends keyof InterviewSetupForm>(key: K, value: InterviewSetupForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setForm(DEFAULT_SETUP_FORM), []);

  return { form, updateField, reset };
}
