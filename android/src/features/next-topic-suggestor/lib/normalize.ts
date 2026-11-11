// src/features/next-topic-suggestor/lib/normalize.ts
/** Turns raw model output into typed recommendations. Empty entries are dropped. */
import { asRecord, listOf, textOf } from "@/features/projects/lib/normalise";
import type { NextTopicResult, TopicRecommendation } from "../types";

function toRecommendation(raw: unknown): TopicRecommendation {
  const item = asRecord(raw);
  return { topicName: textOf(item.topicName), reason: textOf(item.reason), kept: item.kept === true };
}

export function normalizeRecommendations(raw: unknown): NextTopicResult {
  const record = asRecord(raw);
  return {
    recommendations: listOf(record.recommendations as unknown[])
      .map(toRecommendation)
      .filter((item) => item.topicName !== ""),
  };
}
