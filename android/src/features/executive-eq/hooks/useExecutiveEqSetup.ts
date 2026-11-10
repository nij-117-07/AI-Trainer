// src/features/executive-eq/hooks/useExecutiveEqSetup.ts
/**
 * Scenario form for the New simulation page. The form is kept on the device. A successful start
 * saves the new simulation (replacing the old one) before calling onStarted.
 */
import { useEffect, useRef } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { saveDocument } from "@/lib/document-store";
import { DEFAULT_SCENARIO_FORM } from "../options";
import { startSimulation } from "../lib/generators";
import { EQ_STORAGE_KEYS, restoreForm } from "../lib/persistence";
import type { ExecutiveEqSession, ScenarioFormValues } from "../types";
import { usePersistedDocument } from "./usePersistedDocument";

const restoreFormDraft = (saved: unknown) => restoreForm(DEFAULT_SCENARIO_FORM, saved);

export function useExecutiveEqSetup(onStarted: () => void) {
  const { settings } = useAiSettings();
  const form = usePersistedDocument<ScenarioFormValues>(EQ_STORAGE_KEYS.form, DEFAULT_SCENARIO_FORM, restoreFormDraft);
  const start = useRequest(startSimulation);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  function update<K extends keyof ScenarioFormValues>(key: K, value: ScenarioFormValues[K]) {
    form.setValue((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const values = form.value;
    const scenario = await start.run(settings, values, controller.signal);
    if (!scenario || controller.signal.aborted) return;
    const session: ExecutiveEqSession = {
      scenario,
      learningFocus: values.learningFocus,
      narrativeArc: values.narrativeArc,
      chatHistory: [{ role: "npc", content: scenario.openingHook }],
      log: [{ role: "assistant", content: scenario.openingHook }],
      grades: [],
      lastBriefing: null,
      scenarioContext: scenario.settingDescription,
      npcLastStatement: scenario.openingHook,
    };
    await saveDocument(EQ_STORAGE_KEYS.session, session).catch(() => undefined);
    onStarted();
  }

  function reset() {
    activeRequest.current?.abort();
    form.setValue(DEFAULT_SCENARIO_FORM);
    start.reset();
  }

  return {
    form: form.value,
    update,
    pending: start.pending,
    error: start.error,
    submit,
    reset,
  };
}

export type ExecutiveEqSetupState = ReturnType<typeof useExecutiveEqSetup>;
