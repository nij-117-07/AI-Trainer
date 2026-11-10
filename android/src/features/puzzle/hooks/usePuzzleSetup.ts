// src/features/puzzle/hooks/usePuzzleSetup.ts
/**
 * Puzzle setup form, used on the New puzzle page. The form is kept on the device. A successful
 * generate saves the new round (replacing the old one) before calling onGenerated.
 */
import { useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { DEFAULT_PUZZLE_FORM } from "../options";
import { generatePuzzle } from "../lib/generators";
import { PUZZLE_FORM_KEY, PUZZLE_ROUND_KEY, parseSavedForm } from "../lib/persistence";
import type { PuzzleFormValues } from "../types";

export function usePuzzleSetup(onGenerated: () => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<PuzzleFormValues>(DEFAULT_PUZZLE_FORM);
  const [loaded, setLoaded] = useState(false);
  const generate = useRequest(generatePuzzle);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(PUZZLE_FORM_KEY, null)
      .then((saved) => {
        if (active) setForm(parseSavedForm(saved));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(PUZZLE_FORM_KEY, form).catch(() => undefined);
  }, [loaded, form]);

  useEffect(() => () => activeRequest.current?.abort(), []);

  function update<K extends keyof PuzzleFormValues>(key: K, value: PuzzleFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const puzzle = await generate.run(settings, form, controller.signal);
    if (!puzzle || controller.signal.aborted) return;
    await saveDocument(PUZZLE_ROUND_KEY, {
      puzzle,
      puzzleType: form.puzzleType.trim(),
      attempts: [],
      userAnswer: "",
    }).catch(() => undefined);
    onGenerated();
  }

  function reset() {
    activeRequest.current?.abort();
    setForm(DEFAULT_PUZZLE_FORM);
    generate.reset();
  }

  return {
    form,
    update,
    pending: generate.pending,
    error: generate.error,
    submit,
    reset,
  };
}

export type PuzzleSetupState = ReturnType<typeof usePuzzleSetup>;
