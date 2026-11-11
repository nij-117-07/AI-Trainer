// src/features/next-topic-suggestor/lib/result.ts
/** Kept-state helpers for the saved topic result (DESIGN.md section 9.4). */
import { mergeKept } from "@/lib/kept";
import type { NextTopicResult, TopicRecommendation } from "../types";

export function topicKey(item: TopicRecommendation): string {
  return item.topicName.trim().toLowerCase();
}

export function mergeTopicBatch(previous: NextTopicResult | null, generated: NextTopicResult): NextTopicResult {
  return { recommendations: mergeKept(previous?.recommendations ?? [], generated.recommendations, topicKey) };
}

export function toggleTopicKept(result: NextTopicResult, index: number): NextTopicResult {
  return {
    recommendations: result.recommendations.map((item, i) => (i === index ? { ...item, kept: !item.kept } : item)),
  };
}
