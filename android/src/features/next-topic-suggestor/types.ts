// src/features/next-topic-suggestor/types.ts

export type TopicLevel = "Beginner" | "Intermediate" | "Advanced";

export interface NextTopicFormValues {
  broaderTopic: string;
  specificInterest: string;
  learnedBefore: string;
  previousSuggestions: string;
  customUserInput: string;
  topicLevel: TopicLevel;
}

export interface TopicRecommendation {
  topicName: string;
  reason: string;
}

export interface NextTopicResult {
  recommendations: TopicRecommendation[];
}
