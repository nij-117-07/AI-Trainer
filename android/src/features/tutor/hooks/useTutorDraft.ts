// src/features/tutor/hooks/useTutorDraft.ts
/** The tutor form, kept on the device so an unfinished question survives leaving the screen. */
import { useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { TutorFormValues } from "../types";
import { DEFAULT_TUTOR_FORM } from "../lib/options";
import { parseTutorDraft } from "../lib/tutor-input";

export const DRAFT_STORAGE_KEY = "learning.tutor.draft.v2";

export function useTutorDraft() {
  const [form, setForm] = useState<TutorFormValues>(DEFAULT_TUTOR_FORM);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadDocument<unknown>(DRAFT_STORAGE_KEY, null)
      .catch(() => null)
      .then((raw) => {
        setForm(parseTutorDraft(raw, DEFAULT_TUTOR_FORM));
        setHydrated(true);
      });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void saveDocument(DRAFT_STORAGE_KEY, form).catch(() => undefined);
  }, [hydrated, form]);

  return { form, setForm };
}
