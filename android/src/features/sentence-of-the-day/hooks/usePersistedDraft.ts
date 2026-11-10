// src/features/sentence-of-the-day/hooks/usePersistedDraft.ts
/** Keeps the Sentence of the Day form on the device, and the last sentence for the page to reload on focus. */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { isRecord } from "../lib/text";
import { SENTENCE_FORM_KEY, SENTENCE_RESULT_KEY, mergeSavedForm } from "../lib/persistence";
import type { SentenceOfTheDay } from "../types";

export function usePersistedForm<TForm extends object>(defaults: TForm) {
  const [form, setForm] = useState<TForm>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(SENTENCE_FORM_KEY, null)
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
    saveDocument(SENTENCE_FORM_KEY, form).catch(() => undefined);
  }, [loaded, form]);

  const reset = useCallback(() => {
    setForm(defaults);
  }, [defaults]);

  return { form, setForm, reset };
}

export function usePersistedSentence(): SentenceOfTheDay | null {
  const [sentence, setSentence] = useState<SentenceOfTheDay | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(SENTENCE_RESULT_KEY, null)
        .then((saved) => {
          if (active) setSentence(isRecord(saved) ? (saved as unknown as SentenceOfTheDay) : null);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  return sentence;
}
