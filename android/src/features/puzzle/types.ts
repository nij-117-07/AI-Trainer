// src/features/puzzle/types.ts

export const PUZZLE_TYPES = ["riddle", "logic grid", "sequence", "wordplay", "cipher"] as const;
export type PuzzleType = (typeof PUZZLE_TYPES)[number];

export const COGNITIVE_DOMAINS = ["verbal", "mathematical", "spatial", "lateral"] as const;
export type CognitiveDomain = (typeof COGNITIVE_DOMAINS)[number];

export const DIFFICULTY_LEVELS = ["novice", "intermediate", "expert", "genius"] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export interface PuzzleFormValues {
  fieldOfInterest: string;
  puzzleType: PuzzleType;
  targetDomain: CognitiveDomain;
  difficultyLevel: DifficultyLevel;
}

export interface Puzzle {
  puzzlerPersona: string;
  puzzleText: string;
  solution: string;
  cognitiveTrigger: string;
}

export interface PuzzleEvaluation {
  isCorrect: boolean;
  accuracyScore: number;
  evaluationFeedback: string;
  hintRedirection: string | null;
  metacognitivePrompt: string;
}

export interface PuzzleAttempt {
  answer: string;
  evaluation: PuzzleEvaluation;
}

/** The guess-until-correct round: the puzzle, its type, every attempt so far, and the draft answer. */
export interface PuzzleRound {
  puzzle: Puzzle;
  puzzleType: PuzzleType;
  attempts: PuzzleAttempt[];
  userAnswer: string;
}
