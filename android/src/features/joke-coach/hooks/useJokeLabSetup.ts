// src/features/joke-coach/hooks/useJokeLabSetup.ts
/**
 * Joke Lab setup form, used on the New scenario page. The form is kept on the device. A successful
 * generate starts a new round (replacing the old one, but keeping the chosen joke style and goal)
 * before calling onGenerated.
 */
import { useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { DEFAULT_IMPROVEMENT_GOAL, DEFAULT_JOKE_STYLE, DEFAULT_LAB_FORM } from "../options";
import { generateScenario } from "../lib/generators";
import { JOKE_LAB_FORM_KEY, JOKE_LAB_ROUND_KEY, parseSavedForm, readRound } from "../lib/persistence";
import type { JokeLabForm } from "../types";

export function useJokeLabSetup(onGenerated: () => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<JokeLabForm>(DEFAULT_LAB_FORM);
  const [loaded, setLoaded] = useState(false);
  const generate = useRequest(generateScenario);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(JOKE_LAB_FORM_KEY, null)
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
    saveDocument(JOKE_LAB_FORM_KEY, form).catch(() => undefined);
  }, [loaded, form]);

  useEffect(() => () => activeRequest.current?.abort(), []);

  function update<K extends keyof JokeLabForm>(key: K, value: JokeLabForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    const scenario = await generate.run(settings, form, controller.signal);
    if (!scenario || controller.signal.aborted) return;
    const previous = readRound(await loadDocument<unknown>(JOKE_LAB_ROUND_KEY, null).catch(() => null));
    await saveDocument(JOKE_LAB_ROUND_KEY, {
      language: form.language.trim(),
      scenario,
      draft: "",
      attempts: [],
      extra: null,
      jokeStyle: previous?.jokeStyle ?? DEFAULT_JOKE_STYLE,
      improvementGoal: previous?.improvementGoal ?? DEFAULT_IMPROVEMENT_GOAL,
    }).catch(() => undefined);
    onGenerated();
  }

  function reset() {
    activeRequest.current?.abort();
    setForm(DEFAULT_LAB_FORM);
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

export type JokeLabSetupState = ReturnType<typeof useJokeLabSetup>;
