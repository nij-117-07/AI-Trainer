// src/features/resource-suggestor/types.ts

export interface ResourceSuggestorFormValues {
  backgroundSubject: string;
  targetTopic: string;
  resourceType: string;
  additionalPreferences: string;
}

export interface ResourceItem {
  kept: boolean;
  title: string;
  type: string;
  authorOrCreator: string;
  description: string;
  difficultyLevel: string;
  estimatedTime: string;
  accessInfo: string;
}

export interface ResourceSuggestorResult {
  recommendedResources: ResourceItem[];
  nextSteps: string;
}

export interface ResourceSuggestorDraft {
  form: ResourceSuggestorFormValues;
  result: ResourceSuggestorResult | null;
}
