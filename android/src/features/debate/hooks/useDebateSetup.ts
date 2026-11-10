// src/features/debate/hooks/useDebateSetup.ts
/**
 * Persona form for the New debate page. The form is kept on the device. A successful build saves
 * the new debate (replacing the old one), with the form values it was built from, before calling
 * onBuilt.
 */
import { useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { saveDocument } from "@/lib/document-store";
import { createPersonas } from "../lib/generators";
import { DEBATE_STORAGE_KEYS, FORM_DEFAULTS, restoreForm } from "../lib/persistence";
import { createSession } from "../lib/session";
import type { DebateSession, PersonaFormValues, PersonaInput } from "../types";
import { buildPersonaInput } from "../lib/validate";
import { useAbortableTask } from "./useAbortableTask";
import { useStoredDocument } from "./useStoredDocument";

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong. Please try again.";
}

export function useDebateSetup(onBuilt: () => void) {
  const { settings } = useAiSettings();
  const form = useStoredDocument<PersonaFormValues>(DEBATE_STORAGE_KEYS.form, FORM_DEFAULTS, restoreForm);
  const build = useAbortableTask(createPersonas);
  const [localError, setLocalError] = useState<string | null>(null);

  function update<K extends keyof PersonaFormValues>(key: K, value: PersonaFormValues[K]) {
    form.setValue((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    setLocalError(null);
    const values = form.value;
    let inputs: PersonaInput[];
    try {
      inputs = [buildPersonaInput(values, "pro"), buildPersonaInput(values, "con")];
    } catch (err) {
      setLocalError(messageOf(err));
      return;
    }
    const personas = await build.run(settings, inputs);
    if (!personas) return;
    const session: DebateSession = {
      ...createSession(inputs[0].topic, personas[0], personas[1]),
      setup: values,
    };
    await saveDocument(DEBATE_STORAGE_KEYS.session, session).catch(() => undefined);
    onBuilt();
  }

  function reset() {
    build.cancel();
    setLocalError(null);
    form.setValue(FORM_DEFAULTS);
  }

  return {
    form: form.value,
    update,
    pending: build.pending,
    error: localError ?? build.error,
    submit,
    reset,
  };
}

export type DebateSetupState = ReturnType<typeof useDebateSetup>;
