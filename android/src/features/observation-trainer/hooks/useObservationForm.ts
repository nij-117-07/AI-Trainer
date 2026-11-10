// src/features/observation-trainer/hooks/useObservationForm.ts
/**
 * Observation Trainer form, used on the New training page. The form is kept on the device. The
 * chosen image lives in memory only. A successful training saves the report (replacing the old one)
 * before calling onGenerated.
 */
import { useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { ImageInput } from "@/lib/image";
import { DEFAULT_OBSERVATION_FORM } from "../options";
import { trainObservation } from "../lib/generators";
import { OBSERVATION_FORM_KEY, OBSERVATION_RESULT_KEY, parseSavedForm } from "../lib/persistence";
import type { ObservationFormValues } from "../types";
import { useImageSearch } from "./useImageSearch";

export function useObservationForm(onGenerated: () => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<ObservationFormValues>(DEFAULT_OBSERVATION_FORM);
  const [loaded, setLoaded] = useState(false);
  const [image, setImage] = useState<ImageInput | null>(null);
  const imageSearch = useImageSearch(setImage);
  const request = useRequest(trainObservation);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(OBSERVATION_FORM_KEY, null)
      .then((saved) => {
        if (active) setForm(parseSavedForm(saved));
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
    saveDocument(OBSERVATION_FORM_KEY, form).catch(() => undefined);
  }, [loaded, form]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof ObservationFormValues>(key: K, value: ObservationFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function pickImage(next: ImageInput | null) {
    setImage(next);
    imageSearch.clearChoice();
  }

  async function submit() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const result = await request.run(settings, { form, image }, controller.signal);
    if (!result || controller.signal.aborted) return;
    await saveDocument(OBSERVATION_RESULT_KEY, result).catch(() => undefined);
    onGenerated();
  }

  function reset() {
    controllerRef.current?.abort();
    setForm(DEFAULT_OBSERVATION_FORM);
    setImage(null);
    imageSearch.reset();
    request.reset();
  }

  return {
    form,
    update,
    image,
    pickImage,
    imageSearch,
    pending: request.pending,
    error: request.error,
    submit,
    reset,
  };
}

export type ObservationFormState = ReturnType<typeof useObservationForm>;
