// src/features/learning/tutor/hooks/usePromptTemplates.ts
/**
 * Loads the saved system prompt templates from the server once and resolves a
 * template's content by name, so picking one from the selector fills the
 * system prompt field instantly (no per-selection round trip).
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import type { PromptResponse } from "../types";
import { getAllPromptsAction } from "../actions/prompts";

export function usePromptTemplates() {
  const [prompts, setPrompts] = useState<PromptResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPrompts(await getAllPromptsAction());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load prompt templates.");
    }
  }, []);

  useEffect(() => {
    // Mount-time load; the null prompts value is the intended loading feedback.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const getContent = useCallback(
    (name: string): string =>
      prompts?.find((prompt) => prompt.name === name)?.content ?? "",
    [prompts]
  );

  return {
    prompts,
    isLoading: prompts === null && !error,
    error,
    getContent,
    reload: load,
  };
}
