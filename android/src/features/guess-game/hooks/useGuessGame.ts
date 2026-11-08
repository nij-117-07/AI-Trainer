// src/features/guess-game/hooks/useGuessGame.ts
/**
 * Owns the Guess Game state: the setup draft and the running game, both kept on the device. Each
 * model call gets its own AbortSignal, and a call that was cancelled never changes the game.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadDocument, removeDocument, saveDocument } from "@/lib/document-store";
import { requestCoaching, requestHint, makeGuess, startGame } from "../lib/generators";
import { GUESS_GAME_KEYS, mergeSavedForm } from "../lib/persistence";
import { parseSavedSession, recordCoaching, recordGuess, recordHint, startSession } from "../lib/session-model";
import type { GameSetupFormValues, GuessGameSession } from "../types";

export type GamePending = "start" | "guess" | "hint" | "coach" | null;

const DEFAULT_FORM: GameSetupFormValues = {
  category: "word",
  difficulty: "medium",
  vocabularyTheme: "",
};

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function useGuessGame() {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<GameSetupFormValues>(DEFAULT_FORM);
  const [session, setSession] = useState<GuessGameSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState<GamePending>(null);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      loadDocument<unknown>(GUESS_GAME_KEYS.form, null),
      loadDocument<unknown>(GUESS_GAME_KEYS.session, null),
    ])
      .then(([savedForm, savedSession]) => {
        if (!active) return;
        setForm(mergeSavedForm(DEFAULT_FORM, savedForm));
        setSession(parseSavedSession(savedSession));
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
    saveDocument(GUESS_GAME_KEYS.form, form).catch(() => undefined);
  }, [loaded, form]);

  useEffect(() => {
    if (!loaded) return;
    const write = session ? saveDocument(GUESS_GAME_KEYS.session, session) : removeDocument(GUESS_GAME_KEYS.session);
    write.catch(() => undefined);
  }, [loaded, session]);

  useEffect(() => () => controller.current?.abort(), []);

  const run = useCallback(
    async <T>(call: Exclude<GamePending, null>, task: (signal: AbortSignal) => Promise<T>): Promise<T | null> => {
      controller.current?.abort();
      const current = new AbortController();
      controller.current = current;
      setError(null);
      setPending(call);
      try {
        const result = await task(current.signal);
        return current.signal.aborted ? null : result;
      } catch (err) {
        if (!current.signal.aborted) setError(messageOf(err));
        return null;
      } finally {
        if (controller.current === current) {
          controller.current = null;
          setPending(null);
        }
      }
    },
    [],
  );

  const updateForm = useCallback(<K extends keyof GameSetupFormValues>(key: K, value: GameSetupFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const start = useCallback(
    async (values: GameSetupFormValues) => {
      if (pending) return;
      const setup = await run("start", (signal) => startGame(settings, values, signal));
      if (!setup) return;
      setSession(startSession(setup, values.category, values.difficulty));
    },
    [pending, run, settings],
  );

  const guess = useCallback(
    async (text: string) => {
      if (!session || session.solved || pending) return;
      const current = session;
      const result = await run("guess", (signal) =>
        makeGuess(
          settings,
          {
            mysteryItem: current.mysteryItem,
            category: current.category,
            difficulty: current.difficulty,
            guess: text,
          },
          signal,
        ),
      );
      if (!result) return;
      setSession((prev) => (prev ? recordGuess(prev, text, result) : prev));
    },
    [pending, run, session, settings],
  );

  const getHint = useCallback(async () => {
    if (!session || session.solved || pending) return;
    const current = session;
    const result = await run("hint", (signal) =>
      requestHint(
        settings,
        {
          mysteryItem: current.mysteryItem,
          category: current.category,
          previousHints: current.hints,
        },
        signal,
      ),
    );
    if (!result) return;
    setSession((prev) => (prev ? recordHint(prev, result) : prev));
  }, [pending, run, session, settings]);

  const getCoaching = useCallback(async () => {
    if (!session || session.solved || pending) return;
    const current = session;
    const result = await run("coach", (signal) =>
      requestCoaching(
        settings,
        {
          mysteryItem: current.mysteryItem,
          category: current.category,
          failedGuesses: current.guesses,
          hintNumber: current.hints.length,
        },
        signal,
      ),
    );
    if (!result) return;
    setSession((prev) => (prev ? recordCoaching(prev, result) : prev));
  }, [pending, run, session, settings]);

  const reset = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    setPending(null);
    setError(null);
    setSession(null);
    setForm(DEFAULT_FORM);
  }, []);

  return {
    form,
    updateForm,
    session,
    loaded,
    pending,
    error,
    start,
    guess,
    getHint,
    getCoaching,
    reset,
  };
}
