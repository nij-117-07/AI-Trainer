// src/features/joke-coach/types.ts

export interface GenerateJokeFormValues {
  topic: string;
  jokeStyle: string;
  audience: string;
}

export interface GeneratedJoke {
  joke: string;
  setup: string;
  punchline: string;
  humorType: string;
  difficultyRating: number;
}

export interface EvaluateJokeFormValues {
  jokeText: string;
  intendedAudience: string;
  context: string;
}

export interface JokeEvaluation {
  overallScore: number;
  humorScore: number;
  originalityScore: number;
  deliveryScore: number;
  appropriateness: string;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  isRecommended: boolean;
}

export interface RewriteJokeFormValues {
  originalJoke: string;
  improvementGoal: string;
  targetAudience: string;
}

export interface RewrittenJoke {
  rewrittenJoke: string;
  setup: string;
  punchline: string;
  changesMade: string[];
  performanceNotes: string;
}

export interface ClassifyJokeFormValues {
  jokeText: string;
}

export interface JokeClassification {
  style: string;
  humorMechanism: string;
  structure: string;
  tags: string[];
  practiceCategory: string;
  similarJokeStyles: string[];
}

export interface PracticeFormValues {
  currentSkillLevel: string;
  practiceFocus: string;
  sessionGoal: string;
  userJoke: string;
}

export interface PracticeSession {
  exerciseType: string;
  exerciseInstructions: string;
  practiceJoke: string | null;
  drillPrompt: string;
  successCriteria: string[];
  nextSteps: string[];
}

export interface CrowdFormValues {
  jokeText: string;
  venueType: string;
  audienceDemographic: string;
}

export interface CrowdSimulation {
  predictedResponse: string;
  laughProbability: number;
  bestDeliveryStyle: string;
  potentialRisks: string[];
  alternativePunchline: string | null;
  crowdWorkOpportunity: string;
}

export type JokeMode = "generate" | "evaluate" | "rewrite" | "classify" | "practice" | "crowd";
