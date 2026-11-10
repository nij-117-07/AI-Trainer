// src/features/message-refiner/hooks/usePersistedDraft.ts
/** Keeps the Message Refiner form and its last refined message on the device. The result reloads when its page is focused. */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadDocument, saveDocument } from "@/lib/document-store";
import {
  MESSAGE_REFINER_DEFAULTS,
  MESSAGE_REFINER_FORM_KEY,
  MESSAGE_REFINER_RESULT_KEY,
  restoreForm,
  restoreRefinement,
  type SavedMessageRefinement,
} from "../lib/persistence";
import type { MessageRefinerFormValues } from "../types";

export function usePersistedForm() {
  const [form, setForm] = useState<MessageRefinerFormValues>(MESSAGE_REFINER_DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(MESSAGE_REFINER_FORM_KEY, null)
      .then((saved) => {
        if (active) setForm(restoreForm(saved));
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
    saveDocument(MESSAGE_REFINER_FORM_KEY, form).catch(() => undefined);
  }, [loaded, form]);

  const reset = useCallback(() => {
    setForm(MESSAGE_REFINER_DEFAULTS);
  }, []);

  return { form, setForm, reset };
}

export async function saveMessageRefinement(saved: SavedMessageRefinement): Promise<void> {
  await saveDocument(MESSAGE_REFINER_RESULT_KEY, saved);
}

/** The result page's view of the last refinement. Each edit is saved at once. */
export function usePersistedRefinement() {
  const [saved, setState] = useState<SavedMessageRefinement | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(MESSAGE_REFINER_RESULT_KEY, null)
        .then((raw) => {
          if (active) setState(restoreRefinement(raw));
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  const setSaved = useCallback((next: SavedMessageRefinement) => {
    setState(next);
    saveMessageRefinement(next).catch(() => undefined);
  }, []);

  return { saved, setSaved };
}
