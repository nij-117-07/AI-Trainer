// src/features/resource-suggestor/types.ts

export interface ResourceSuggestorFormValues {
  backgroundSubject: string;
  targetTopic: string;
  additionalPreferences: string;
}

export interface ResourceItem {
  title: string;
  type: string;
  authorOrCreator: string;
  description: string;
  difficultyLevel: string;
  estimatedTime: string;
  whyRecommended: string;
  prerequisiteKnowledge: string;
  accessInfo: string;
}

export interface ResourceSuggestorResult {
  learningPathSummary: string;
  recommendedResources: ResourceItem[];
  nextSteps: string;
}

export interface ResourceSuggestorDraft {
  form: ResourceSuggestorFormValues;
  result: ResourceSuggestorResult | null;
}
