// src/features/joke-coach/hooks/useJokeLab.ts
/**
 * State for the Joke Lab: the scenario, the joke and each submitted attempt, and the AI extras.
 * It is saved on the device like the other Joke Coach modes. One AI request runs at a time, and
 * reset or leaving the screen cancels the one in flight.
 */
import { useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { DEFAULT_LAB_STATE } from "../options";
import { evaluateJoke, generateJoke, generateScenario, rewriteJoke } from "../lib/generators";
import { JOKE_LAB_STORAGE_KEY, parseSavedLab } from "../lib/persistence";
import type { JokeLabState, LabTask } from "../types";

const FALLBACK_ERROR = "Something went wrong. Please try again.";

export function useJokeLab() {
  const { settings } = useAiSettings();
  const [state, setState] = useState<JokeLabState>(DEFAULT_LAB_STATE);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState<LabTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(JOKE_LAB_STORAGE_KEY, null)
      .then((saved) => {
        if (active) setState(parseSavedLab(saved));
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
    if (loaded) saveDocument(JOKE_LAB_STORAGE_KEY, state).catch(() => undefined);
  }, [loaded, state]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  function update<K extends keyof JokeLabState>(key: K, value: JokeLabState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

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

  async function newScenario() {
    const { language, theme } = state;
    const scenario = await run("scenario", (signal) => generateScenario(settings, { language, theme }, signal));
    if (scenario) setState((prev) => ({ ...prev, scenario, draft: "", attempts: [], extra: null }));
  }

  async function submitJoke() {
    const { scenario, language, draft } = state;
    if (!scenario) return;
    const joke = draft.trim();
    const evaluation = await run("evaluate", (signal) =>
      evaluateJoke(settings, { language, scenario, jokeText: joke }, signal),
    );
    if (evaluation) setState((prev) => ({ ...prev, attempts: [...prev.attempts, { joke, evaluation }] }));
  }

  async function getJoke() {
    const { scenario, language, jokeStyle } = state;
    if (!scenario) return;
    const joke = await run("joke", (signal) => generateJoke(settings, { language, jokeStyle, scenario }, signal));
    if (joke) setState((prev) => ({ ...prev, extra: { kind: "joke", joke } }));
  }

  async function improveJoke() {
    const { scenario, attempts, language, improvementGoal } = state;
    const latest = attempts[attempts.length - 1];
    if (!scenario || !latest) return;
    const rewrite = await run("improve", (signal) =>
      rewriteJoke(
        settings,
        { language, joke: latest.joke, goal: improvementGoal, audience: scenario.audience },
        signal,
      ),
    );
    if (rewrite) setState((prev) => ({ ...prev, extra: { kind: "improved", source: latest.joke, rewrite } }));
  }

  function reset() {
    controllerRef.current?.abort();
    setPending(null);
    setError(null);
    setState((prev) => ({
      ...DEFAULT_LAB_STATE,
      language: prev.language,
      theme: prev.theme,
      jokeStyle: prev.jokeStyle,
      improvementGoal: prev.improvementGoal,
    }));
  }

  return { state, update, pending, error, newScenario, submitJoke, getJoke, improveJoke, reset };
}
