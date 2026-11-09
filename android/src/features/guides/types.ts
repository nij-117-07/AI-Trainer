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
