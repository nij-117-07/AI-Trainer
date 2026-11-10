// src/features/message-refiner/lib/persistence.ts
/** Storage keys, defaults, and safe restore of the saved form and refined message. */
import { toneOptions } from "../options";
import type { MessageRefinerFormValues, MessageRefinerResult, MessageTone } from "../types";
import { toMessageRefinerResult } from "./normalise";
import { AUDIENCE_MAX, GOAL_MAX, MESSAGE_MAX } from "./validate";

export const MESSAGE_REFINER_FORM_KEY = "tools.message-refiner.form.v1";
export const MESSAGE_REFINER_RESULT_KEY = "tools.message-refiner.result.v1";

export const MESSAGE_REFINER_DEFAULTS: MessageRefinerFormValues = {
  message: "",
  tone: "friendly",
  audience: "",
  goal: "",
};

export interface SavedMessageRefinement {
  form: MessageRefinerFormValues;
  result: MessageRefinerResult;
}

function recordOf(raw: unknown): Record<string, unknown> | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

/** Keeps each saved field only when it has the right type. A damaged or old tone falls back to the default. */
export function restoreForm(raw: unknown): MessageRefinerFormValues {
  const saved = recordOf(raw);
  if (!saved) return MESSAGE_REFINER_DEFAULTS;
  const tone = toneOptions.some((option) => option.value === saved.tone)
    ? (saved.tone as MessageTone)
    : MESSAGE_REFINER_DEFAULTS.tone;
  return {
    message: typeof saved.message === "string" ? saved.message.slice(0, MESSAGE_MAX) : "",
    tone,
    audience: typeof saved.audience === "string" ? saved.audience.slice(0, AUDIENCE_MAX) : "",
    goal: typeof saved.goal === "string" ? saved.goal.slice(0, GOAL_MAX) : "",
  };
}

/** Returns the saved refinement, or null when none is stored. An emptied message is kept, so an edit that clears the text does not remove the result. */
export function restoreRefinement(raw: unknown): SavedMessageRefinement | null {
  const saved = recordOf(raw);
  if (!saved || recordOf(saved.result) === null) return null;
  return { form: restoreForm(saved.form), result: toMessageRefinerResult(saved.result) };
}
