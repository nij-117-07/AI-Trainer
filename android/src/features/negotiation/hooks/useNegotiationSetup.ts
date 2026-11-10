// src/features/negotiation/hooks/useNegotiationSetup.ts
/**
 * Negotiation setup form, used on the New negotiation page. The form is kept on the device. A
 * successful start saves the new negotiation (replacing the old one) before calling onStarted.
 */
import { useEffect, useRef } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { saveDocument } from "@/lib/document-store";
import { DEFAULT_SCENARIO_FORM } from "../options";
import { startScenario } from "../lib/generators";
import { mergeSavedForm, NEGOTIATION_FORM_KEY, NEGOTIATION_SESSION_KEY } from "../lib/persistence";
import type { NegotiationSession, ScenarioFormValues } from "../types";
import { usePersistedValue } from "./usePersistedValue";

export function useNegotiationSetup(onStarted: () => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = usePersistedValue<ScenarioFormValues>(NEGOTIATION_FORM_KEY, DEFAULT_SCENARIO_FORM, (saved) =>
    mergeSavedForm(DEFAULT_SCENARIO_FORM, saved),
  );
  const start = useRequest(startScenario);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  function update<K extends keyof ScenarioFormValues>(key: K, value: ScenarioFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const scenario = await start.run(settings, form, controller.signal);
    if (!scenario || controller.signal.aborted) return;
    const session: NegotiationSession = {
      id: Date.now().toString(36),
      scenario,
      log: [{ role: "opponent", text: scenario.startingStanceOpponent }],
      complete: false,
      finalOutcome: "",
      report: null,
    };
    await saveDocument(NEGOTIATION_SESSION_KEY, session).catch(() => undefined);
    onStarted();
  }

  function reset() {
    activeRequest.current?.abort();
    setForm(DEFAULT_SCENARIO_FORM);
    start.reset();
  }

  return {
    form,
    update,
    pending: start.pending,
    error: start.error,
    submit,
    reset,
  };
}

export type NegotiationSetupState = ReturnType<typeof useNegotiationSetup>;
