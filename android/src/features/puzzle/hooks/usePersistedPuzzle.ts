// src/features/puzzle/hooks/usePersistedPuzzle.ts
/** Keeps the Puzzle Generator form and the current guess-until-correct round on the device. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, removeDocument, saveDocument } from "@/lib/document-store";
import { DEFAULT_PUZZLE_FORM } from "../options";
import { PUZZLE_FORM_KEY, PUZZLE_ROUND_KEY, parseSavedForm } from "../lib/persistence";
import { readRound } from "../lib/normalize";
import type { PuzzleFormValues, PuzzleRound } from "../types";

export function usePersistedPuzzle() {
  const [form, setForm] = useState<PuzzleFormValues>(DEFAULT_PUZZLE_FORM);
  const [round, setRound] = useState<PuzzleRound | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([loadDocument<unknown>(PUZZLE_FORM_KEY, null), loadDocument<unknown>(PUZZLE_ROUND_KEY, null)])
      .then(([savedForm, savedRound]) => {
        if (!active) return;
        setForm(parseSavedForm(savedForm));
        setRound(readRound(savedRound));
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

  useEffect(() => {
    if (!loaded) return;
    const write = round ? saveDocument(PUZZLE_ROUND_KEY, round) : removeDocument(PUZZLE_ROUND_KEY);
    write.catch(() => undefined);
  }, [loaded, round]);

  const reset = useCallback(() => {
    setForm(DEFAULT_PUZZLE_FORM);
    setRound(null);
  }, []);

  return { form, setForm, round, setRound, reset };
}
