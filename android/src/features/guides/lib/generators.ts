// src/features/guides/lib/generators.ts
/**
 * Learning Guides generators. Each function validates its input, applies the same fallbacks as
 * Backend/learning/guides/services.py, calls the model through Ax, and normalises the result.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { CURRENT_LEVELS, TOPIC_LEVELS } from "../options";
import type {
  GuideTaskFormValues,
  GuideTaskResult,
  SuggestTopicsFormValues,
  SuggestTopicsResult,
} from "../types";
import { taskGuideSignature, whatToLearnSignature } from "./signatures";
import { normalizeGuideTasks, normalizeTopics } from "./normalize";
import { variationSeed } from "./text";
import { clampCount, optionalLines, optionalText, requireOption, requireText } from "./validate";

const TEMPERATURE = 0.7;

export async function generateGuideTasks(settings: AiSettings, values: GuideTaskFormValues): Promise<GuideTaskResult> {
  const llm = createLlm(settings);
  const result = await ax(taskGuideSignature).forward(
    llm,
    {
      randomSeed: variationSeed(),
      learningSubject: requireText(values.subject, "Subject", 200),
      targetGoal: requireText(values.goal, "Goal", 500),
      currentLevel: requireOption(values.currentLevel, CURRENT_LEVELS, "Current level"),
      numTasks: clampCount(values.count, 1, 10),
      previousTasks: optionalLines(values.history, "Tasks already completed", 2000),
      customInstructions: optionalText(values.instructions, "Instructions", 1000) ?? "Focus on best practices.",
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeGuideTasks(result);
}

export async function suggestTopics(settings: AiSettings, values: SuggestTopicsFormValues): Promise<SuggestTopicsResult> {
  const llm = createLlm(settings);
  const result = await ax(whatToLearnSignature).forward(
    llm,
    {
      broaderTopic: requireText(values.broaderTopic, "Broader topic", 200),
      specificInterest: requireText(values.specificInterest, "Specific interest", 200),
      learnedBefore: requireText(values.learnedBefore, "Background knowledge", 2000),
      previousSuggestions: optionalLines(values.previousSuggestions, "Previously suggested topics", 2000),
      customUserInput: optionalText(values.customUserInput, "Custom input", 1000),
      topicLevel: requireOption(values.topicLevel, TOPIC_LEVELS, "Topic level"),
      seedUuid: variationSeed(),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeTopics(result);
}
