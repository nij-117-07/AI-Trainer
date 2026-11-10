// src/features/topic-of-the-day/hooks/usePersistedDraft.ts
/** Keeps the Topic of the Day form on the device, and the last topic for the page to reload on focus. */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { isRecord } from "../lib/text";
import { TOPIC_OF_THE_DAY_FORM_KEY, TOPIC_OF_THE_DAY_RESULT_KEY, mergeSavedForm } from "../lib/persistence";
import type { TopicOfTheDay } from "../types";

export function usePersistedForm<TForm extends object>(defaults: TForm) {
  const [form, setForm] = useState<TForm>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(TOPIC_OF_THE_DAY_FORM_KEY, null)
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
    saveDocument(TOPIC_OF_THE_DAY_FORM_KEY, form).catch(() => undefined);
  }, [loaded, form]);

  const reset = useCallback(() => {
    setForm(defaults);
  }, [defaults]);

  return { form, setForm, reset };
}

export function usePersistedTopic(): TopicOfTheDay | null {
  const [topic, setTopic] = useState<TopicOfTheDay | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(TOPIC_OF_THE_DAY_RESULT_KEY, null)
        .then((saved) => {
          if (active) setTopic(isRecord(saved) ? (saved as unknown as TopicOfTheDay) : null);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  return topic;
}
