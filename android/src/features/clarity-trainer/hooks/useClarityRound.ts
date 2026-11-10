// src/features/clarity-trainer/hooks/useClarityRound.ts
/**
 * Scenario state for the practice page: the saved scenario, the reply draft, and the review call.
 * The round is kept on the device and reloaded each time the page is focused, so a scenario
 * generated on the New scenario page appears when the user comes back.
 */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { evaluateResponse } from "../lib/generators";
import { CLARITY_STORAGE_KEYS, restoreRound } from "../lib/persistence";
import type { ClarityRound } from "../types";
import { useAbortableTask } from "./useAbortableTask";

export function useClarityRound() {
  const { settings } = useAiSettings();
  const [round, setRound] = useState<ClarityRound | null>(null);
  const [loaded, setLoaded] = useState(false);
  const evaluate = useAbortableTask(evaluateResponse);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(CLARITY_STORAGE_KEYS.round, null)
        .then((saved) => {
          if (active) setRound(restoreRound(saved));
        })
        .catch(() => undefined)
        .finally(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  useEffect(() => {
    if (!loaded) return;
    saveDocument(CLARITY_STORAGE_KEYS.round, round).catch(() => undefined);
  }, [loaded, round]);

  async function submitResponse() {
    const current = round;
    if (!current) return;
    const response = current.response.trim();
    if (!response) return;
    setRound({ ...current, response });
    const evaluation = await evaluate.run(settings, current.scenario, response);
    if (!evaluation) return;
    setRound((latest) =>
      latest && latest.scenario === current.scenario ? { ...latest, response, evaluation } : latest,
    );
  }

  function changeResponse(text: string) {
    setRound((latest) => (latest ? { ...latest, response: text } : latest));
  }

  return {
    loaded,
    round,
    busy: evaluate.pending,
    error: evaluate.error,
    submitResponse,
    changeResponse,
  };
}

export type ClarityRoundState = ReturnType<typeof useClarityRound>;
