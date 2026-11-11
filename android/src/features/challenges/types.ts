// src/features/challenges/types.ts

export type ChallengeType = "solve" | "build" | "debug" | "explain";
export type ChallengeLevel = "beginner" | "intermediate" | "advanced";

export interface ChallengeFormValues {
  topic: string;
  challengeType: ChallengeType;
  skillLevel: ChallengeLevel;
  timeMinutes: number;
  numChallenges: number;
  instructions: string;
}

export interface Challenge {
  kept: boolean;
  title: string;
  prompt: string;
  successCriteria: string[];
  hints: string[];
  estimatedMinutes: number | null;
}

export interface ChallengeResult {
  challenges: Challenge[];
  coachNote: string;
}

export interface ChallengeDraft {
  form: ChallengeFormValues;
  result: ChallengeResult | null;
}
