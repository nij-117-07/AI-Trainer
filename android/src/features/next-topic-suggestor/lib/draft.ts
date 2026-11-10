// src/features/next-topic-suggestor/lib/draft.ts
/**
 * Saved form and last result for the Next Topic Suggestor, kept on the device. Stored JSON is not
 * trusted, so every field is checked when it is read back.
 */
import { asRecord } from "@/features/projects/lib/normalise";
import { isTopicLevel, LIMITS } from "../options";
import type { NextTopicFormValues, NextTopicResult } from "../types";
import { normalizeRecommendations } from "./normalize";

export const NEXT_TOPIC_DRAFT_KEY = "learning.next-topic-suggestor.v1";

export const DEFAULT_NEXT_TOPIC_FORM: NextTopicFormValues = {
  broaderTopic: "",
  specificInterest: "",
  learnedBefore: "",
  previousSuggestions: "",
  customUserInput: "",
  topicLevel: "Beginner",
};

export interface NextTopicDraft {
  form: NextTopicFormValues;
  result: NextTopicResult | null;
}

function savedText(value: unknown, fallback: string, max: number): string {
  return typeof value === "string" ? value.slice(0, max) : fallback;
}

export function normalizeNextTopicDraft(raw: unknown): NextTopicDraft {
  const source = asRecord(raw);
  const form = asRecord(source.form);
  const hasResult = typeof source.result === "object" && source.result !== null;
  return {
    form: {
      broaderTopic: savedText(form.broaderTopic, DEFAULT_NEXT_TOPIC_FORM.broaderTopic, LIMITS.broaderTopic),
      specificInterest: savedText(form.specificInterest, DEFAULT_NEXT_TOPIC_FORM.specificInterest, LIMITS.specificInterest),
      learnedBefore: savedText(form.learnedBefore, DEFAULT_NEXT_TOPIC_FORM.learnedBefore, LIMITS.learnedBefore),
      previousSuggestions: savedText(form.previousSuggestions, DEFAULT_NEXT_TOPIC_FORM.previousSuggestions, LIMITS.previousSuggestions),
      customUserInput: savedText(form.customUserInput, DEFAULT_NEXT_TOPIC_FORM.customUserInput, LIMITS.customUserInput),
      topicLevel: isTopicLevel(form.topicLevel) ? form.topicLevel : DEFAULT_NEXT_TOPIC_FORM.topicLevel,
    },
    result: hasResult ? normalizeRecommendations(source.result) : null,
  };
}
