// src/features/foresight-trainer/hooks/useForesightRun.ts
/**
 * Running scenario state: the saved session, the chosen option, the reasoning, and the decision
 * request. The session is reloaded each time the scenario page is focused, so a scenario started on
 * the New scenario page appears when the user comes back.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { processDecision } from "../lib/generators";
import { FORESIGHT_STORAGE_KEYS, restoreSession } from "../lib/persistence";
import { applyDecision } from "../lib/session";
import type { ForesightSession } from "../types";

export const CUSTOM_CHOICE = "__custom__";

export function useForesightRun() {
  const { settings } = useAiSettings();
  const [session, setSession] = useState<ForesightSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [customChoice, setCustomChoice] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [choiceError, setChoiceError] = useState<string | null>(null);
  const decide = useRequest(processDecision);
  const { reset: resetDecision } = decide;
  const activeRequest = useRef<AbortController | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(FORESIGHT_STORAGE_KEYS.session, null)
        .then((saved) => {
          if (!active) return;
          setSession(restoreSession(saved));
          setSelected(null);
          setCustomChoice("");
          setReasoning("");
          setChoiceError(null);
          resetDecision();
        })
        .catch(() => undefined)
        .finally(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, [resetDecision]),
  );

  useEffect(() => {
    if (!loaded) return;
    saveDocument(FORESIGHT_STORAGE_KEYS.session, session).catch(() => undefined);
  }, [loaded, session]);

  useEffect(() => () => activeRequest.current?.abort(), []);

  const choice = selected === CUSTOM_CHOICE ? customChoice.trim() : (selected ?? "");

  function choose(id: string) {
    setSelected(id);
    setChoiceError(null);
  }

  async function submit() {
    const current = session;
    if (!current || current.scenarioComplete || decide.pending) return;
    if (!choice) {
      setChoiceError("Choose an option before you commit.");
      return;
    }
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const outcome = await decide.run(
      settings,
      { session: current, choice, reasoning: reasoning.trim() },
      controller.signal,
    );
    if (!outcome || controller.signal.aborted) return;
    setSession((prev) => (prev ? applyDecision(prev, outcome) : prev));
    setSelected(null);
    setCustomChoice("");
    setReasoning("");
    setChoiceError(null);
  }

  function reset() {
    activeRequest.current?.abort();
    decide.reset();
    setChoiceError(null);
    setSelected(null);
    setCustomChoice("");
    setReasoning("");
    setSession(null);
  }

  return {
    loaded,
    session,
    selected,
    choose,
    choice,
    customChoice,
    setCustomChoice,
    reasoning,
    setReasoning,
    pending: decide.pending,
    error: choiceError ?? decide.error,
    submit,
    reset,
  };
}

export type ForesightRunState = ReturnType<typeof useForesightRun>;
