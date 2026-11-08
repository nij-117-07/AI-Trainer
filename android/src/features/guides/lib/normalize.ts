// src/features/guides/lib/normalize.ts
/**
 * Turns raw model output into the typed results the screens render. Every list is checked, every
 * item is read field by field, and empty entries are dropped.
 */
import type {
  DailyPlanResult,
  GuideTask,
  GuideTaskResult,
  ProjectBlueprintResult,
  ProjectIdea,
  SuggestProjectsResult,
  SuggestTopicsResult,
  TopicRecommendation,
} from "../types";
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

export function normalizeDailyPlan(raw: {
  learningObjective?: unknown;
  masteryGapAnalysis?: unknown;
  structuredRoadmap?: unknown;
  recommendedExercise?: unknown;
  resourceSuggestions?: unknown;
}): DailyPlanResult {
  return {
    learningObjective: textOf(raw.learningObjective),
    masteryGapAnalysis: textOf(raw.masteryGapAnalysis),
    structuredRoadmap: textList(raw.structuredRoadmap),
    recommendedExercise: textOf(raw.recommendedExercise),
    resourceSuggestions: textOf(raw.resourceSuggestions),
  };
}

export function normalizeProjectBlueprint(
  raw: {
    projectName?: unknown;
    industryContext?: unknown;
    problemStatement?: unknown;
    technicalRequirements?: unknown;
    stretchGoals?: unknown;
    validationCriteria?: unknown;
  },
  randomSeed: string,
): ProjectBlueprintResult {
  return {
    projectName: textOf(raw.projectName),
    industryContext: textOf(raw.industryContext),
    problemStatement: textOf(raw.problemStatement),
    technicalRequirements: textList(raw.technicalRequirements),
    stretchGoals: textList(raw.stretchGoals),
    validationCriteria: textOf(raw.validationCriteria),
    randomSeed,
  };
}

export function normalizeTopics(raw: { recommendations?: unknown }): SuggestTopicsResult {
  const recommendations: TopicRecommendation[] = listOf(raw.recommendations)
    .filter(isRecord)
    .map((item) => ({ topicName: textOf(item.topicName), reason: textOf(item.reason) }))
    .filter((item) => item.topicName);
  return { recommendations };
}

export function normalizeProjects(raw: { briefStrategy?: unknown; projects?: unknown }): SuggestProjectsResult {
  const projects: ProjectIdea[] = listOf(raw.projects)
    .filter(isRecord)
    .map((item) => ({
      title: textOf(item.title),
      problem: textOf(item.problem),
      keyFeatures: textList(item.keyFeatures),
    }))
    .filter((project) => project.title || project.problem);
  return { briefStrategy: textOf(raw.briefStrategy), projects };
}
