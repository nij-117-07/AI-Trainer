// src/features/guides/lib/normalize.ts
/**
 * Turns raw model output into the typed results the screens render. Every list is checked, every
 * item is read field by field, and empty entries are dropped.
 */
import type { GuideTask, GuideTaskResult, SuggestTopicsResult, TopicRecommendation } from "../types";
import { isRecord, listOf, numberOf, textList, textOf } from "./text";

export function normalizeGuideTasks(raw: { mentorFeedback?: unknown; taskList?: unknown }): GuideTaskResult {
  const tasks: GuideTask[] = listOf(raw.taskList)
    .filter(isRecord)
    .map((item) => ({
      title: textOf(item.title),
      description: textOf(item.description),
      difficulty: textOf(item.difficulty),
      learningOutcomes: textList(item.learningOutcomes),
      estimatedHours: numberOf(item.estimatedHours),
    }))
    .filter((task) => task.title || task.description);
  return { mentorFeedback: textOf(raw.mentorFeedback), tasks };
}

export function normalizeTopics(raw: { recommendations?: unknown }): SuggestTopicsResult {
  const recommendations: TopicRecommendation[] = listOf(raw.recommendations)
    .filter(isRecord)
    .map((item) => ({ topicName: textOf(item.topicName), reason: textOf(item.reason) }))
    .filter((item) => item.topicName);
  return { recommendations };
}
