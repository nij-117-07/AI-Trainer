// src/features/joke-coach/types.ts

export interface GeneratedJoke {
  joke: string;
  setup: string;
  punchline: string;
  humorType: string;
  difficultyRating: number;
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

export interface RewrittenJoke {
  rewrittenJoke: string;
  setup: string;
  punchline: string;
  changesMade: string[];
  performanceNotes: string;
}

export interface JokeScenario {
  title: string;
  situation: string;
  audience: string;
}

export interface JokeLabAttempt {
  joke: string;
  evaluation: JokeEvaluation;
}

export type JokeLabExtra =
  | { kind: "joke"; joke: GeneratedJoke }
  | { kind: "improved"; source: string; rewrite: RewrittenJoke };

export type LabTask = "scenario" | "evaluate" | "joke" | "improve";

/** Everything the Joke Lab keeps on the device between visits. */
export interface JokeLabState {
  language: string;
  theme: string;
  jokeStyle: string;
  improvementGoal: string;
  scenario: JokeScenario | null;
  draft: string;
  attempts: JokeLabAttempt[];
  extra: JokeLabExtra | null;
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

export type JokeMode = "lab" | "classify" | "practice" | "crowd";
