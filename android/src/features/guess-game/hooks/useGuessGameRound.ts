// src/features/guess-game/hooks/useGuessGameRound.ts
/**
 * Guess Game state for the running game: the session, the guess draft, and the hint and coaching
 * requests. The session is saved on the device and reloaded each time the game page is focused, so
 * a game started on the New game page appears when the user comes back. One AI request runs at a
 * time, and a result that arrives for a game that was replaced is dropped.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadDocument, removeDocument, saveDocument } from "@/lib/document-store";
import { makeGuess, requestCoaching, requestHint } from "../lib/generators";
import { GUESS_GAME_KEYS } from "../lib/persistence";
import { parseSavedSession, recordCoaching, recordGuess, recordHint } from "../lib/session-model";
import type { GuessGameSession } from "../types";

export type GamePending = "guess" | "hint" | "coach" | null;

const FALLBACK_ERROR = "Something went wrong. Please try again.";

export function useGuessGameRound() {
  const { settings } = useAiSettings();
  const [session, setSession] = useState<GuessGameSession | null>(null);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState<GamePending>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(GUESS_GAME_KEYS.session, null)
        .then((saved) => {
          if (!active) return;
          setSession(parseSavedSession(saved));
          setDraft("");
          setError(null);
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
    const write = session ? saveDocument(GUESS_GAME_KEYS.session, session) : removeDocument(GUESS_GAME_KEYS.session);
    write.catch(() => undefined);
  }, [loaded, session]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function run<T>(call: Exclude<GamePending, null>, task: (signal: AbortSignal) => Promise<T>): Promise<T | null> {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setError(null);
    setPending(call);
    try {
      const value = await task(controller.signal);
      return controller.signal.aborted ? null : value;
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : FALLBACK_ERROR);
      return null;
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setPending(null);
      }
    }
  }

  /** Applies a change only while the same game is still the active one. */
  function updateSession(game: GuessGameSession, change: (latest: GuessGameSession) => GuessGameSession) {
    setSession((latest) => (latest && latest.mysteryItem === game.mysteryItem ? change(latest) : latest));
  }

  async function submitGuess(): Promise<boolean> {
    const current = session;
    const guess = draft.trim();
    if (!current || current.solved || !guess) return false;
    const result = await run("guess", (signal) =>
      makeGuess(
        settings,
        {
          mysteryItem: current.mysteryItem,
          category: current.category,
          difficulty: current.difficulty,
          guess,
        },
        signal,
      ),
    );
    if (!result) return false;
    updateSession(current, (latest) => recordGuess(latest, guess, result));
    setDraft("");
    return true;
  }

  async function getHint() {
    const current = session;
    if (!current || current.solved) return;
    const result = await run("hint", (signal) =>
      requestHint(
        settings,
        {
          mysteryItem: current.mysteryItem,
          category: current.category,
          previousHints: current.hints.map((item) => item.hint),
        },
        signal,
      ),
    );
    if (result) updateSession(current, (latest) => recordHint(latest, result));
  }

  async function getCoaching() {
    const current = session;
    if (!current || current.solved) return;
    const result = await run("coach", (signal) =>
      requestCoaching(
        settings,
        {
          mysteryItem: current.mysteryItem,
          category: current.category,
          failedGuesses: current.attempts.map((attempt) => attempt.guess),
          hintNumber: current.hints.length,
        },
        signal,
      ),
    );
    if (result) updateSession(current, (latest) => recordCoaching(latest, result));
  }

  function changeDraft(text: string) {
    setDraft(text);
  }

  return {
    loaded,
    session,
    draft,
    changeDraft,
    pending,
    error,
    submitGuess,
    getHint,
    getCoaching,
  };
}

export type GuessGameRoundState = ReturnType<typeof useGuessGameRound>;
