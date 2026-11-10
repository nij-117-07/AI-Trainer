// src/features/puzzle/types.ts

/**
 * The form choices are suggestions from the dropdown presets (see options.ts). The dropdowns also
 * accept custom text, so these are plain strings.
 */
export type PuzzleType = string;
export type CognitiveDomain = string;
export type DifficultyLevel = string;

export interface PuzzleFormValues {
  fieldOfInterest: string;
  puzzleType: PuzzleType;
  targetDomain: CognitiveDomain;
  difficultyLevel: DifficultyLevel;
  userInstructions: string;
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
