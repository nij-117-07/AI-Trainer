// src/features/challenges/options.ts
/** Choices for the Challenge Giver form. Each value is sent to the model as written. */
import type { ChallengeLevel, ChallengeType } from "./types";

export interface ChoiceItem<T extends string | number = string> {
  value: T;
  label: string;
}

export const challengeTypeOptions: ChoiceItem<ChallengeType>[] = [
  { value: "solve", label: "Solve a problem" },
  { value: "build", label: "Build something" },
  { value: "debug", label: "Find and fix a bug" },
  { value: "explain", label: "Explain it back" },
];

export const challengeLevelOptions: ChoiceItem<ChallengeLevel>[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const challengeTimeOptions: ChoiceItem<number>[] = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
];
