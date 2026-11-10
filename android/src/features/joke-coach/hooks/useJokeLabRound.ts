// src/features/joke-coach/hooks/useJokeLabRound.ts
/**
 * Joke Lab round state: the scenario, the joke draft and its scored attempts, the coach's extra
 * joke or rewrite, and the chosen joke style and goal. The round is saved on the device and
 * reloaded each time the game page is focused, so a scenario generated on the New scenario page
 * appears when the user comes back. One AI request runs at a time.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadDocument, removeDocument, saveDocument } from "@/lib/document-store";
import { evaluateJoke, generateJoke, rewriteJoke } from "../lib/generators";
import { JOKE_LAB_ROUND_KEY, readRound } from "../lib/persistence";
import type { JokeLabRound, JokeScenario, LabTask } from "../types";

const FALLBACK_ERROR = "Something went wrong. Please try again.";

function isSameScenario(a: JokeScenario, b: JokeScenario): boolean {
  return a.title === b.title && a.situation === b.situation;
}

export function useJokeLabRound() {
  const { settings } = useAiSettings();
  const [round, setRound] = useState<JokeLabRound | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState<LabTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(JOKE_LAB_ROUND_KEY, null)
        .then((saved) => {
          if (!active) return;
          setRound(readRound(saved));
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
    const write = round ? saveDocument(JOKE_LAB_ROUND_KEY, round) : removeDocument(JOKE_LAB_ROUND_KEY);
    write.catch(() => undefined);
  }, [loaded, round]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function run<T>(task: LabTask, work: (signal: AbortSignal) => Promise<T>): Promise<T | null> {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setPending(task);
    setError(null);
    try {
      const value = await work(controller.signal);
      return controller.signal.aborted ? null : value;
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof Error ? err.message : FALLBACK_ERROR);
      return null;
    } finally {
      if (controllerRef.current === controller) setPending(null);
    }
  }

  /** Applies a change only while the same scenario is still the active round. */
  function updateRound(scenario: JokeScenario, change: (latest: JokeLabRound) => JokeLabRound) {
    setRound((latest) => (latest && isSameScenario(latest.scenario, scenario) ? change(latest) : latest));
  }

  async function submitJoke() {
    const current = round;
    const joke = current?.draft.trim();
    if (!current || !joke) return;
    const evaluation = await run("evaluate", (signal) =>
      evaluateJoke(settings, { language: current.language, scenario: current.scenario, jokeText: joke }, signal),
    );
    if (evaluation) {
      updateRound(current.scenario, (latest) => ({ ...latest, attempts: [...latest.attempts, { joke, evaluation }] }));
    }
  }

  async function getJoke() {
    const current = round;
    if (!current) return;
    const joke = await run("joke", (signal) =>
      generateJoke(
        settings,
        { language: current.language, jokeStyle: current.jokeStyle, scenario: current.scenario },
        signal,
      ),
    );
    if (joke) updateRound(current.scenario, (latest) => ({ ...latest, extra: { kind: "joke", joke } }));
  }

  async function improveJoke() {
    const current = round;
    const latest = current?.attempts[current.attempts.length - 1];
    if (!current || !latest) return;
    const rewrite = await run("improve", (signal) =>
      rewriteJoke(
        settings,
        {
          language: current.language,
          joke: latest.joke,
          goal: current.improvementGoal,
          audience: current.scenario.audience,
        },
        signal,
      ),
    );
    if (rewrite) {
      updateRound(current.scenario, (value) => ({
        ...value,
        extra: { kind: "improved", source: latest.joke, rewrite },
      }));
    }
  }

  function changeDraft(text: string) {
    setRound((latest) => (latest ? { ...latest, draft: text } : latest));
  }

  function setJokeStyle(value: string) {
    setRound((latest) => (latest ? { ...latest, jokeStyle: value } : latest));
  }

  function setImprovementGoal(value: string) {
    setRound((latest) => (latest ? { ...latest, improvementGoal: value } : latest));
  }

  return {
    loaded,
    round,
    pending,
    error,
    submitJoke,
    getJoke,
    improveJoke,
    changeDraft,
    setJokeStyle,
    setImprovementGoal,
  };
}

export type JokeLabRoundState = ReturnType<typeof useJokeLabRound>;
