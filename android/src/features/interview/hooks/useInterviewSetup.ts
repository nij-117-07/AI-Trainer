// src/features/interview/hooks/useInterviewSetup.ts
/**
 * New interview page: the saved setup form, validation, and the start action. Starting runs the
 * first decision and returns to the session page only when that step succeeds.
 */
import { useState } from "react";
import { validateSetup } from "../lib/validate";
import type { InterviewSetup } from "../types";
import { useInterviewSession } from "./useInterviewSession";
import { useSetupDraft } from "./useSetupDraft";

export function useInterviewSetup(onStarted: () => void) {
  const draft = useSetupDraft();
  const interview = useInterviewSession();
  const [formError, setFormError] = useState<string | null>(null);

  async function start() {
    let setup: InterviewSetup;
    try {
      setup = validateSetup(draft.form);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Check the interview setup.");
      return;
    }
    setFormError(null);
    if (await interview.start(setup)) onStarted();
  }

  return {
    form: draft.form,
    updateField: draft.updateField,
    reset: draft.reset,
    hasSession: interview.state !== null,
    pending: interview.pending,
    error: formError ?? interview.error,
    start,
  };
}

export type InterviewSetupState = ReturnType<typeof useInterviewSetup>;
