// src/features/ai-detector/hooks/useAiDetector.ts
/**
 * Keeps the AI Detector form and its last result on the device. Saving waits until the stored
 * state has loaded, so the defaults never overwrite what the user typed before.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { useRequest } from "@/hooks/useRequest";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { detectAiText } from "../lib/generators";
import { AI_DETECTOR_STORAGE_KEY, INITIAL_AI_DETECTOR_STATE, parseSavedState } from "../lib/persistence";
import type { AiDetection, AiDetectorSavedState, DetectFormValues } from "../types";

export interface AiDetectorState {
  form: DetectFormValues;
  result: AiDetection | null;
  loaded: boolean;
  pending: boolean;
  error: string | null;
  update: <K extends keyof DetectFormValues>(key: K, value: DetectFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useAiDetector(): AiDetectorState {
  const { settings } = useAiSettings();
  const [saved, setSaved] = useState<AiDetectorSavedState>(INITIAL_AI_DETECTOR_STATE);
  const [loaded, setLoaded] = useState(false);
  const request = useRequest(detectAiText);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(AI_DETECTOR_STORAGE_KEY, null)
      .then((stored) => {
        if (active) setSaved(parseSavedState(stored));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
      controllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(AI_DETECTOR_STORAGE_KEY, saved).catch(() => undefined);
  }, [loaded, saved]);

  const update = useCallback(<K extends keyof DetectFormValues>(key: K, value: DetectFormValues[K]) => {
    setSaved((prev) => ({ ...prev, form: { ...prev.form, [key]: value } }));
  }, []);

  const submit = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const result = await request.run(settings, saved.form, controller.signal);
    if (result && !controller.signal.aborted) {
      setSaved((prev) => ({ ...prev, result }));
    }
  }, [request.run, saved.form, settings]);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    request.reset();
    setSaved(INITIAL_AI_DETECTOR_STATE);
  }, [request.reset]);

  return {
    form: saved.form,
    result: saved.result,
    loaded,
    pending: request.pending,
    error: request.error,
    update,
    submit,
    reset,
  };
}
