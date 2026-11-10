// src/features/explainer/types.ts

export interface ExplainFormValues {
  topic: string;
  explanationLevel: string;
  context: string;
}

export interface ExplainResult {
  explanation: string;
  keyTakeaway: string;
}

export interface TutorialFormValues {
  topic: string;
  expertiseLevel: string;
  explanationStyle: string;
}

export interface TutorialResult {
  fullExplanation: string;
}

export interface FeynmanFormValues {
  complexTopic: string;
  targetAge: number;
}

export interface FeynmanResult {
  explanation: string;
  keyMetaphors: string[];
  funAnalogy: string;
}

export interface SocraticFormValues {
  topic: string;
  context: string;
  userInstructions: string;
  level: string;
  questionCategory: string;
  numQuestions: number;
}

export interface SocraticQuestion {
  questionText: string;
  cognitiveChallenge: string;
  guidingHint: string;
}

export interface SocraticResult {
  pedagogicalGoal: string;
  questionsForDiscovery: SocraticQuestion[];
}
