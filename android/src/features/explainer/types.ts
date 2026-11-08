// src/features/explainer/types.ts

export interface ExplainFormValues {
  topic: string;
  expertiseLevel: string;
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

export interface RoadmapFormValues {
  topic: string;
  expertiseLevel: string;
  explanationStyle: string;
}

export interface RoadmapConcept {
  concept: string;
  explanation: string;
}

export interface RoadmapResult {
  summary: string;
  knowledgeRoadmap: RoadmapConcept[];
  practicalTakeaway: string;
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

export interface JourneyFormValues {
  topic: string;
  expertise: string;
}

export interface JourneyPlan {
  titles: string[];
  prerequisites: string[];
}

export interface JourneyChapter {
  index: number;
  title: string;
  content: string;
  analogy: string;
  jargon: string[];
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

export interface CurriculumFormValues {
  topic: string;
  context: string;
  pastLearning: string;
  userLevel: string;
  userHopes: string;
  additionalInstructions: string;
}

export interface RoadmapPhase {
  phase: string;
  description: string;
  learningObjective: string;
}

export interface CurriculumResult {
  rationale: string;
  theCrux: string;
  learningRoadmap: RoadmapPhase[];
  suggestedFocus: string;
}
