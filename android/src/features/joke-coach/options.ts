// src/features/joke-coach/options.ts
/**
 * Dropdown presets and allowed values for the Joke Coach. Values match the webui options and the
 * backend enums, so the model only ever receives a value the backend accepts.
 */
import type { JokeMode } from "./types";

export interface JokeChoice {
  value: string;
  label: string;
}

export const JOKE_STYLE_OPTIONS: JokeChoice[] = [
  { value: "dad-joke", label: "Dad joke" },
  { value: "pun", label: "Pun" },
  { value: "one-liner", label: "One-liner" },
  { value: "story", label: "Story" },
  { value: "observational", label: "Observational" },
];

export const IMPROVEMENT_GOAL_OPTIONS: JokeChoice[] = [
  { value: "funnier", label: "Funnier" },
  { value: "cleaner", label: "Cleaner" },
  { value: "shorter", label: "Shorter" },
  { value: "more-clever", label: "More clever" },
  { value: "better-timing", label: "Better timing" },
];

export const SKILL_LEVEL_OPTIONS: JokeChoice[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const PRACTICE_FOCUS_OPTIONS: JokeChoice[] = [
  { value: "writing", label: "Writing" },
  { value: "delivery", label: "Delivery" },
  { value: "timing", label: "Timing" },
  { value: "crowd-work", label: "Crowd work" },
  { value: "stage-presence", label: "Stage presence" },
  { value: "all", label: "Everything" },
];

export const VENUE_TYPE_OPTIONS: JokeChoice[] = [
  { value: "comedy-club", label: "Comedy club" },
  { value: "open-mic", label: "Open mic" },
  { value: "corporate-event", label: "Corporate event" },
  { value: "family-gathering", label: "Family gathering" },
  { value: "college-show", label: "College show" },
];

export const JOKE_STYLES = JOKE_STYLE_OPTIONS.map((option) => option.value);
export const IMPROVEMENT_GOALS = IMPROVEMENT_GOAL_OPTIONS.map((option) => option.value);
export const SKILL_LEVELS = SKILL_LEVEL_OPTIONS.map((option) => option.value);
export const PRACTICE_FOCUSES = PRACTICE_FOCUS_OPTIONS.map((option) => option.value);
export const VENUE_TYPES = VENUE_TYPE_OPTIONS.map((option) => option.value);

export const JOKE_MODE_OPTIONS: { value: JokeMode; label: string }[] = [
  { value: "generate", label: "Generate" },
  { value: "evaluate", label: "Evaluate" },
  { value: "rewrite", label: "Rewrite" },
  { value: "classify", label: "Classify" },
  { value: "practice", label: "Practice" },
  { value: "crowd", label: "Crowd Sim" },
];
