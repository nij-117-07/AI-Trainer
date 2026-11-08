// src/features/guides/types.ts

export interface GuideTaskFormValues {
  subject: string;
  goal: string;
  currentLevel: string;
  count: number;
  history: string;
  instructions: string;
}

export interface GuideTask {
  title: string;
  description: string;
  difficulty: string;
  learningOutcomes: string[];
  estimatedHours: number | null;
}

export interface GuideTaskResult {
  mentorFeedback: string;
  tasks: GuideTask[];
}

export interface DailyPlanFormValues {
  masterTopic: string;
  subtopicPreference: string;
  userLevel: string;
  targetMastery: string;
  existingKnowledge: string;
  learningFocus: string;
  history: string;
}

export interface DailyPlanResult {
  learningObjective: string;
  masteryGapAnalysis: string;
  structuredRoadmap: string[];
  recommendedExercise: string;
  resourceSuggestions: string;
}

export interface ProjectBlueprintFormValues {
  masterTopic: string;
  subtopicFocus: string;
  targetMastery: string;
  preferredIndustry: string;
}

export interface ProjectBlueprintResult {
  projectName: string;
  industryContext: string;
  problemStatement: string;
  technicalRequirements: string[];
  stretchGoals: string[];
  validationCriteria: string;
  randomSeed: string;
}

export interface SuggestTopicsFormValues {
  broaderTopic: string;
  specificInterest: string;
  learnedBefore: string;
  previousSuggestions: string;
  customUserInput: string;
  topicLevel: string;
}

export interface TopicRecommendation {
  topicName: string;
  reason: string;
}

export interface SuggestTopicsResult {
  recommendations: TopicRecommendation[];
}

export interface SuggestProjectsFormValues {
  topic: string;
  industry: string;
  numUseCases: number;
  userInstructions: string;
  existingSuggestions: string;
}

export interface ProjectIdea {
  title: string;
  problem: string;
  keyFeatures: string[];
}

export interface SuggestProjectsResult {
  briefStrategy: string;
  projects: ProjectIdea[];
}
