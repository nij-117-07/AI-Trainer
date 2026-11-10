// src/features/joke-coach/lib/persistence.ts
/**
 * Storage keys and saved-value readers for the Joke Lab. The form and the round use separate keys,
 * so the setup page and the game page never overwrite each other.
 */
import { DEFAULT_IMPROVEMENT_GOAL, DEFAULT_JOKE_STYLE, DEFAULT_LAB_FORM, IMPROVEMENT_GOALS, JOKE_STYLES } from "../options";
import type { JokeLabAttempt, JokeLabExtra, JokeLabForm, JokeLabRound, JokeScenario } from "../types";
import { asRecord, normalizeEvaluation, normalizeGeneratedJoke, normalizeRewrite } from "./normalize";
import { isRecord, pickOption, textOf } from "./text";
import { JOKE_MAX, LANGUAGE_MAX, THEME_MAX } from "./validate";

export const JOKE_LAB_FORM_KEY = "practice.joke-coach.lab.form.v1";
export const JOKE_LAB_ROUND_KEY = "practice.joke-coach.lab.round.v1";

/** Takes each saved field that is usable, and falls back to the default for the rest. */
export function parseSavedForm(saved: unknown): JokeLabForm {
  if (!isRecord(saved)) return DEFAULT_LAB_FORM;
  return {
    language: textOf(saved.language).slice(0, LANGUAGE_MAX) || DEFAULT_LAB_FORM.language,
    theme: textOf(saved.theme).slice(0, THEME_MAX),
  };
}

function readScenario(value: unknown): JokeScenario | null {
  if (!isRecord(value) || !textOf(value.situation)) return null;
  return {
    title: textOf(value.title) || "Untitled scenario",
    situation: textOf(value.situation),
    audience: textOf(value.audience) || "general audience",
  };
}

function readAttempts(value: unknown): JokeLabAttempt[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).flatMap((attempt) => {
    const joke = textOf(attempt.joke);
    return joke ? [{ joke, evaluation: normalizeEvaluation(asRecord(attempt.evaluation)) }] : [];
  });
}

function readExtra(value: unknown): JokeLabExtra | null {
  if (!isRecord(value)) return null;
  if (value.kind === "joke" && isRecord(value.joke)) {
    return { kind: "joke", joke: normalizeGeneratedJoke(value.joke) };
  }
  if (value.kind === "improved" && isRecord(value.rewrite)) {
    return { kind: "improved", source: textOf(value.source), rewrite: normalizeRewrite(value.rewrite) };
  }
  return null;
}

/** Reads the saved round. A round with no usable scenario counts as no round. */
export function readRound(saved: unknown): JokeLabRound | null {
  if (!isRecord(saved)) return null;
  const scenario = readScenario(saved.scenario);
  if (!scenario) return null;
  return {
    language: textOf(saved.language).slice(0, LANGUAGE_MAX) || DEFAULT_LAB_FORM.language,
    scenario,
    draft: typeof saved.draft === "string" ? saved.draft.slice(0, JOKE_MAX) : "",
    attempts: readAttempts(saved.attempts),
    extra: readExtra(saved.extra),
    jokeStyle: pickOption(saved.jokeStyle, JOKE_STYLES, DEFAULT_JOKE_STYLE),
    improvementGoal: pickOption(saved.improvementGoal, IMPROVEMENT_GOALS, DEFAULT_IMPROVEMENT_GOAL),
  };
}
