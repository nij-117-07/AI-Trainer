// src/features/guides/lib/generators.ts
/**
 * Learning Guides generators. Each function validates its input, applies the same fallbacks as
 * Backend/learning/guides/services.py, calls the model through Ax, and normalises the result.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import {
  CURRENT_LEVELS,
  DAILY_PLAN_LEVELS,
  LEARNING_FOCUSES,
  TARGET_MASTERY_LEVELS,
  TOPIC_LEVELS,
} from "../options";
import type {
  DailyPlanFormValues,
  DailyPlanResult,
  GuideTaskFormValues,
  GuideTaskResult,
  ProjectBlueprintFormValues,
  ProjectBlueprintResult,
  SuggestProjectsFormValues,
  SuggestProjectsResult,
  SuggestTopicsFormValues,
  SuggestTopicsResult,
} from "../types";
import {
  dailyPlannerSignature,
  projectArchitectSignature,
  projectSuggestorSignature,
  taskGuideSignature,
  whatToLearnSignature,
} from "./signatures";
import {
  normalizeDailyPlan,
  normalizeGuideTasks,
  normalizeProjectBlueprint,
  normalizeProjects,
  normalizeTopics,
} from "./normalize";
import { seedId, variationSeed } from "./text";
import {
  clampCount,
  optionalLines,
  optionalText,
  requireOption,
  requireText,
} from "./validate";

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

export async function generateDailyPlan(settings: AiSettings, values: DailyPlanFormValues): Promise<DailyPlanResult> {
  const llm = createLlm(settings);
  const result = await ax(dailyPlannerSignature).forward(
    llm,
    {
      randomSeed: variationSeed(),
      masterTopic: requireText(values.masterTopic, "Master topic", 200),
      subtopicPreference: optionalText(values.subtopicPreference, "Subtopic preference", 500) ?? "Logical progression",
      userLevel: requireOption(values.userLevel, DAILY_PLAN_LEVELS, "Your level"),
      targetMastery: requireOption(values.targetMastery, TARGET_MASTERY_LEVELS, "Target mastery"),
      existingKnowledge: requireText(values.existingKnowledge, "Existing knowledge", 2000),
      learningFocus: requireOption(values.learningFocus, LEARNING_FOCUSES, "Learning focus"),
      previouslyLearnedTopics: optionalText(values.history, "Previous session context", 2000) ?? "None",
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeDailyPlan(result);
}

export async function generateProjectBlueprint(
  settings: AiSettings,
  values: ProjectBlueprintFormValues,
): Promise<ProjectBlueprintResult> {
  const llm = createLlm(settings);
  const result = await ax(projectArchitectSignature).forward(
    llm,
    {
      randomSeed: variationSeed(),
      masterTopic: requireText(values.masterTopic, "Master topic", 200),
      subtopicFocus: requireText(values.subtopicFocus, "Subtopic focus", 200),
      targetMastery: requireText(values.targetMastery, "Target mastery", 200),
      preferredIndustry: optionalText(values.preferredIndustry, "Preferred industry", 200) ?? "General Tech",
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeProjectBlueprint(result, seedId(8));
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

export async function suggestProjects(
  settings: AiSettings,
  values: SuggestProjectsFormValues,
): Promise<SuggestProjectsResult> {
  const llm = createLlm(settings);
  const result = await ax(projectSuggestorSignature).forward(
    llm,
    {
      topic: requireText(values.topic, "Topic", 200),
      industry: requireText(values.industry, "Industry", 200),
      numUseCases: clampCount(values.numUseCases, 1, 10),
      existingSuggestions: optionalLines(values.existingSuggestions, "Existing suggestions", 2000),
      userInstructions: optionalText(values.userInstructions, "Instructions", 1000) ?? "No specific instructions.",
      randomSeed: variationSeed(),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeProjects(result);
}
