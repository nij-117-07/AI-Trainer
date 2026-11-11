// src/features/topic-of-the-day/hooks/usePersistedDraft.ts
/** Keeps the topic form on the device, and loads the topic library each time its page is focused. */
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { EMPTY_TOPIC_LIBRARY } from "../lib/library";
import { TOPIC_OF_THE_DAY_FORM_KEY, changeTopicLibrary, loadTopicLibrary, mergeSavedForm } from "../lib/persistence";
import type { TopicLibrary } from "../types";

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

export function useTopicLibrary() {
  const [library, setLibrary] = useState<TopicLibrary>(EMPTY_TOPIC_LIBRARY);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadTopicLibrary()
        .then((next) => {
          if (!active) return;
          setLibrary(next);
          setLoaded(true);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  const change = useCallback(async (edit: (current: TopicLibrary) => TopicLibrary) => {
    const next = await changeTopicLibrary(edit);
    setLibrary(next);
  }, []);

  return { library, loaded, change };
}

export function showSaveError() {
  Alert.alert("Could not save", "Please try again.");
}
