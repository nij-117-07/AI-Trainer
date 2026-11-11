// src/features/next-topic-suggestor/options.ts
/** Dropdown presets and input limits for the Next Topic Suggestor. */
import type { TopicLevel } from "./types";

export const LIMITS = {
  broaderTopic: 200,
  specificInterest: 200,
  learnedBefore: 2000,
  previousSuggestions: 2000,
  customUserInput: 1000,
} as const;

export function isTopicLevel(value: unknown): value is TopicLevel {
  return value === "Beginner" || value === "Intermediate" || value === "Advanced";
}
