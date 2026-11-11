// src/features/topic-of-the-day/hooks/usePersistedDraft.ts
/** Keeps the topic form on the device, and loads the topic library each time its page is focused. */
import { useCallback, useEffect, useRef, useState } from "react";
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

let libraryQueue: Promise<unknown> = Promise.resolve();

function queueLibrary<T>(task: () => Promise<T>): Promise<T> {
  const run = libraryQueue.then(task);
  libraryQueue = run.catch(() => undefined);
  return run;
}

export interface PendingLibraryDelete {
  message: string;
  apply: (library: TopicLibrary) => TopicLibrary;
}

/**
 * Topic library for one page. A delete is hidden at once and kept as pending until the undo
 * snackbar dismisses, a new delete replaces it, or the page loses focus.
 */
export function useTopicLibrary() {
  const [saved, setSaved] = useState<TopicLibrary>(EMPTY_TOPIC_LIBRARY);
  const [pending, setPending] = useState<PendingLibraryDelete | null>(null);
  const [loaded, setLoaded] = useState(false);
  const pendingRef = useRef<PendingLibraryDelete | null>(null);

  const commitPending = useCallback(() => {
    const item = pendingRef.current;
    if (!item) return;
    pendingRef.current = null;
    setPending(null);
    setSaved((current) => item.apply(current));
    queueLibrary(() => changeTopicLibrary(item.apply))
      .then(setSaved)
      .catch(showSaveError);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      queueLibrary(loadTopicLibrary)
        .then((next) => {
          if (!active) return;
          setSaved(next);
          setLoaded(true);
        })
        .catch(() => undefined);
      return () => {
        active = false;
        commitPending();
      };
    }, [commitPending]),
  );

  const change = useCallback(async (edit: (current: TopicLibrary) => TopicLibrary) => {
    const next = await queueLibrary(() => changeTopicLibrary(edit));
    setSaved(next);
  }, []);

  const removeLater = useCallback(
    (item: PendingLibraryDelete) => {
      commitPending();
      pendingRef.current = item;
      setPending(item);
    },
    [commitPending],
  );

  const undo = useCallback(() => {
    pendingRef.current = null;
    setPending(null);
  }, []);

  return {
    library: pending ? pending.apply(saved) : saved,
    loaded,
    pending,
    change,
    removeLater,
    undo,
    dismiss: commitPending,
  };
}

export function showSaveError() {
  Alert.alert("Could not save", "Please try again.");
}
