// src/features/joke-coach/lib/normalize.ts
/**
 * Turns raw model output into the typed results the Joke Lab renders. Enum-like values fall back
 * to the same defaults as Backend/practice/joke_coach/services.py.
 */
import type { GeneratedJoke, JokeEvaluation, JokeScenario, RewrittenJoke } from "../types";
import { booleanOf, isRecord, pickOption, scoreOf, textList, textOf, wholeOf } from "./text";

const SCENARIO_TITLE_MAX = 120;
const SCENARIO_SITUATION_MAX = 500;
const SCENARIO_AUDIENCE_MAX = 200;

const APPROPRIATENESS = ["all-ages", "teen", "mature", "nsfw"] as const;

export function normalizeGeneratedJoke(raw: Record<string, unknown>): GeneratedJoke {
  return {
    joke: textOf(raw.joke),
    setup: textOf(raw.setup),
    punchline: textOf(raw.punchline),
    humorType: textOf(raw.humorType),
    difficultyRating: wholeOf(raw.difficultyRating, 3, 1, 5),
  };
}

export function normalizeScenario(raw: Record<string, unknown>): JokeScenario {
  const situation = textOf(raw.situation).slice(0, SCENARIO_SITUATION_MAX);
  if (!situation) throw new Error("The model did not return a scenario. Please try again.");
  return {
    title: textOf(raw.title).slice(0, SCENARIO_TITLE_MAX) || "Untitled scenario",
    situation,
    audience: textOf(raw.audience).slice(0, SCENARIO_AUDIENCE_MAX) || "general audience",
  };
}

export function normalizeEvaluation(raw: Record<string, unknown>): JokeEvaluation {
  return {
    overallScore: scoreOf(raw.overallScore, 5, 10),
    humorScore: scoreOf(raw.humorScore, 5, 10),
    originalityScore: scoreOf(raw.originalityScore, 5, 10),
    deliveryScore: scoreOf(raw.deliveryScore, 5, 10),
    appropriateness: pickOption(raw.appropriateness, APPROPRIATENESS, "teen"),
    strengths: textList(raw.strengths),
    weaknesses: textList(raw.weaknesses),
    feedback: textOf(raw.feedback),
    isRecommended: booleanOf(raw.isRecommended),
  };
}

export function normalizeRewrite(raw: Record<string, unknown>): RewrittenJoke {
  return {
    rewrittenJoke: textOf(raw.rewrittenJoke),
    setup: textOf(raw.setup),
    punchline: textOf(raw.punchline),
    changesMade: textList(raw.changesMade),
    performanceNotes: textOf(raw.performanceNotes),
  };
}

/** Raw model output as a record. Anything that is not an object becomes an empty record. */
export function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}
