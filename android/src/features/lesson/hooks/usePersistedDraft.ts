// src/features/lesson/hooks/usePersistedDraft.ts
/** Keeps the Language Lesson form on the device, and the last lesson for the lesson page to reload on focus. */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { isRecord } from "../lib/text";
import { LESSON_FORM_KEY, LESSON_RESULT_KEY, mergeSavedForm } from "../lib/persistence";
import type { Lesson } from "../types";

export function usePersistedForm<TForm extends object>(defaults: TForm) {
  const [form, setForm] = useState<TForm>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(LESSON_FORM_KEY, null)
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
    saveDocument(LESSON_FORM_KEY, form).catch(() => undefined);
  }, [loaded, form]);

  const reset = useCallback(() => {
    setForm(defaults);
  }, [defaults]);

  return { form, setForm, reset };
}

export function usePersistedLesson(): Lesson | null {
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(LESSON_RESULT_KEY, null)
        .then((saved) => {
          if (active) setLesson(isRecord(saved) ? (saved as unknown as Lesson) : null);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  return lesson;
}
