// src/features/word-of-the-day/hooks/usePersistedDraft.ts
/** Keeps the Word of the Day form on the device, and the last word for the Word of the Day page to reload on focus. */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { isRecord } from "../lib/text";
import { WORD_OF_THE_DAY_FORM_KEY, WORD_OF_THE_DAY_RESULT_KEY, mergeSavedForm } from "../lib/persistence";
import { unsavedResult } from "../lib/result-store";
import type { WordOfTheDay } from "../types";

export function usePersistedForm<TForm extends object>(defaults: TForm) {
  const [form, setForm] = useState<TForm>(defaults);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(WORD_OF_THE_DAY_FORM_KEY, null)
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
    saveDocument(WORD_OF_THE_DAY_FORM_KEY, form).then(
      () => setSaveError(false),
      () => setSaveError(true),
    );
  }, [loaded, form]);

  const reset = useCallback(() => {
    setForm(defaults);
  }, [defaults]);

  return { form, setForm, reset, saveError };
}

export function usePersistedWord(): { word: WordOfTheDay | null; saveFailed: boolean } {
  const [word, setWord] = useState<WordOfTheDay | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const unsaved = unsavedResult(WORD_OF_THE_DAY_RESULT_KEY);
      if (unsaved) {
        setWord(unsaved.value as WordOfTheDay);
        setSaveFailed(unsaved.failed);
      } else {
        loadDocument<unknown>(WORD_OF_THE_DAY_RESULT_KEY, null)
          .then((saved) => {
            if (!active) return;
            setWord(isRecord(saved) ? (saved as unknown as WordOfTheDay) : null);
            setSaveFailed(false);
          })
          .catch(() => undefined);
      }
      return () => {
        active = false;
      };
    }, []),
  );

  return { word, saveFailed };
}
