// src/features/subtopic-lister/lib/draft.ts
/**
 * Saved form and last result for the Subtopic Lister, kept on the device. Stored JSON is not
 * trusted, so every field is checked when it is read back.
 */
import { asRecord } from "@/features/projects/lib/normalise";
import { INSTRUCTIONS_MAX, isSubtopicLevel, TOPIC_MAX } from "../options";
import type { SubtopicFormValues, SubtopicResult } from "../types";
import { toSubtopicResult } from "./normalise";

export const SUBTOPIC_DRAFT_KEY = "learning.subtopic-lister.v1";

export const DEFAULT_SUBTOPIC_FORM: SubtopicFormValues = {
  topic: "",
  level: "beginner",
  instructions: "",
};

export interface SubtopicDraft {
  form: SubtopicFormValues;
  result: SubtopicResult | null;
}

function savedText(value: unknown, fallback: string, max: number): string {
  return typeof value === "string" ? value.slice(0, max) : fallback;
}

export function normalizeSubtopicDraft(raw: unknown): SubtopicDraft {
  const source = asRecord(raw);
  const form = asRecord(source.form);
  const hasResult = typeof source.result === "object" && source.result !== null;
  return {
    form: {
      topic: savedText(form.topic, DEFAULT_SUBTOPIC_FORM.topic, TOPIC_MAX),
      level: isSubtopicLevel(form.level) ? form.level : DEFAULT_SUBTOPIC_FORM.level,
      instructions: savedText(form.instructions, DEFAULT_SUBTOPIC_FORM.instructions, INSTRUCTIONS_MAX),
    },
    result: hasResult ? toSubtopicResult(source.result) : null,
  };
}
