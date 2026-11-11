// src/features/idioms/hooks/usePersistedDraft.ts
/** Keeps the Idioms form on the device, and the last lesson for the Idioms page to reload on focus. */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { isRecord } from "../lib/text";
import { IDIOMS_FORM_KEY, IDIOMS_LESSON_KEY, mergeSavedForm } from "../lib/persistence";
import { unsavedResult } from "../lib/result-store";
import type { IdiomLesson } from "../types";

export function usePersistedForm<TForm extends object>(defaults: TForm) {
  const [form, setForm] = useState<TForm>(defaults);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(IDIOMS_FORM_KEY, null)
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
    saveDocument(IDIOMS_FORM_KEY, form).then(
      () => setSaveError(false),
      () => setSaveError(true),
    );
  }, [loaded, form]);

  const reset = useCallback(() => {
    setForm(defaults);
  }, [defaults]);

  return { form, setForm, reset, saveError };
}

export function usePersistedLesson(): { lesson: IdiomLesson | null; saveFailed: boolean } {
  const [lesson, setLesson] = useState<IdiomLesson | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const unsaved = unsavedResult(IDIOMS_LESSON_KEY);
      if (unsaved) {
        setLesson(unsaved.value as IdiomLesson);
        setSaveFailed(unsaved.failed);
      } else {
        loadDocument<unknown>(IDIOMS_LESSON_KEY, null)
          .then((saved) => {
            if (!active) return;
            setLesson(isRecord(saved) ? (saved as unknown as IdiomLesson) : null);
            setSaveFailed(false);
          })
          .catch(() => undefined);
      }
      return () => {
        active = false;
      };
    }, []),
  );

  return { lesson, saveFailed };
}
