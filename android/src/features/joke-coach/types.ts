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

export type LabTask = "evaluate" | "joke" | "improve";

/** The scenario setup form. It is kept on the device between visits. */
export interface JokeLabForm {
  language: string;
  theme: string;
}

/** The active scenario: the joke draft, every scored attempt, and the coach's extra. Saved on the device. */
export interface JokeLabRound {
  language: string;
  scenario: JokeScenario;
  draft: string;
  attempts: JokeLabAttempt[];
  extra: JokeLabExtra | null;
  jokeStyle: string;
  improvementGoal: string;
}
