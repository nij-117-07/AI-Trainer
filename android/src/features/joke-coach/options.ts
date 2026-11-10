// src/features/joke-coach/options.ts
/**
 * Dropdown presets and allowed values for the Joke Lab. Values match the webui options and the
 * backend enums, so the model only ever receives a value the backend accepts.
 */

export interface JokeChoice {
  value: string;
  label: string;
}

const LANGUAGE_NAMES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Dutch",
  "Hindi",
  "Arabic",
  "Japanese",
  "Korean",
  "Chinese",
  "Russian",
];

export const LANGUAGE_OPTIONS: JokeChoice[] = LANGUAGE_NAMES.map((name) => ({ value: name, label: name }));

export const DEFAULT_LAB_FORM = {
  language: "English",
  theme: "",
};

export const DEFAULT_JOKE_STYLE = "dad-joke";
export const DEFAULT_IMPROVEMENT_GOAL = "funnier";

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

export const JOKE_STYLES = JOKE_STYLE_OPTIONS.map((option) => option.value);
export const IMPROVEMENT_GOALS = IMPROVEMENT_GOAL_OPTIONS.map((option) => option.value);
