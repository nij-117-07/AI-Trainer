// src/features/bias-inoculator/hooks/useBiasInoculator.ts
/**
 * Owns the Cognitive Bias Inoculator form, the last scenario, and the generate action. The form
 * and scenario are saved on the device. A reset ignores any scenario that arrives after it.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { BIAS_FORM_DEFAULTS } from "../options";
import { generateBiasScenario } from "../lib/generators";
import { asSavedScenario, BIAS_STORAGE_KEY, mergeSavedForm, type SavedBiasState } from "../lib/persistence";
import type { BiasFormValues, BiasScenario } from "../types";

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

export function useBiasInoculator() {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<BiasFormValues>(BIAS_FORM_DEFAULTS);
  const [result, setResult] = useState<BiasScenario | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const runId = useRef(0);

  useEffect(() => {
    let active = true;
    loadDocument<Partial<SavedBiasState> | null>(BIAS_STORAGE_KEY, null)
      .then((saved) => {
        if (!active) return;
        setForm(mergeSavedForm(BIAS_FORM_DEFAULTS, saved?.form));
        setResult(asSavedScenario(saved?.result));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
      controller.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const state: SavedBiasState = { form, result };
    saveDocument(BIAS_STORAGE_KEY, state).catch(() => undefined);
  }, [loaded, form, result]);

  const generate = useCallback(async () => {
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    runId.current += 1;
    const id = runId.current;
    setPending(true);
    setError(null);
    try {
      const scenario = await generateBiasScenario(settings, form, next.signal);
      if (id === runId.current) setResult(scenario);
    } catch (err) {
      if (id === runId.current) setError(messageOf(err));
    } finally {
      if (id === runId.current) setPending(false);
    }
  }, [form, settings]);

  const reset = useCallback(() => {
    controller.current?.abort();
    runId.current += 1;
    setPending(false);
    setError(null);
    setResult(null);
    setForm(BIAS_FORM_DEFAULTS);
  }, []);

  return { form, setForm, result, pending, error, generate, reset };
}
