// src/features/clarity-trainer/hooks/useClaritySetup.ts
/**
 * Scenario form for the New scenario page. The form is kept on the device. A successful generate
 * saves the new scenario (replacing the old one) before calling onGenerated.
 */
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { saveDocument } from "@/lib/document-store";
import { generateScenario } from "../lib/generators";
import { CLARITY_STORAGE_KEYS, FORM_DEFAULTS, restoreForm } from "../lib/persistence";
import type { ScenarioFormValues } from "../types";
import { useAbortableTask } from "./useAbortableTask";
import { useStoredDocument } from "./useStoredDocument";

export function useClaritySetup(onGenerated: () => void) {
  const { settings } = useAiSettings();
  const form = useStoredDocument<ScenarioFormValues>(CLARITY_STORAGE_KEYS.form, FORM_DEFAULTS, restoreForm);
  const generate = useAbortableTask(generateScenario);

  function update<K extends keyof ScenarioFormValues>(key: K, value: ScenarioFormValues[K]) {
    form.setValue((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    const scenario = await generate.run(settings, form.value);
    if (!scenario) return;
    await saveDocument(CLARITY_STORAGE_KEYS.round, { scenario, response: "", evaluation: null }).catch(() => undefined);
    onGenerated();
  }

  function reset() {
    generate.cancel();
    form.setValue(FORM_DEFAULTS);
  }

  return {
    form: form.value,
    update,
    pending: generate.pending,
    error: generate.error,
    submit,
    reset,
  };
}

export type ClaritySetupState = ReturnType<typeof useClaritySetup>;
