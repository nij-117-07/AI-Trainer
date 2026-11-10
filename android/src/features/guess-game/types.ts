// src/features/guess-game/types.ts
/** Types for the Guess Game: form values, model results, and the game kept on the device. */

export const GAME_DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;
export type GameDifficulty = (typeof GAME_DIFFICULTIES)[number];

export interface GameSetupFormValues {
  /** A preset category, or the custom text the user typed. */
  category: string;
  difficulty: GameDifficulty;
  vocabularyTheme: string;
}

export interface GameSetupResult {
  mysteryItem: string;
  funFact: string;
  firstHint: string;
  maxGuesses: number;
}

export interface GuessResult {
  correct: boolean;
  feedback: string;
  closeness: number;
  suggestion: string;
}

export interface HintResult {
  hint: string;
  encouragement: string;
}

export interface CoachResult {
  coaching: string;
  framework: string;
  partialReveal: string | null;
  shouldHint: boolean;
}

export interface GameHint {
  hint: string;
  encouragement: string;
}

export interface GuessAttempt {
  guess: string;
  result: GuessResult;
}

/** The running game. Saved on the device, and reloaded when the game page is focused. */
export interface GuessGameSession {
  category: string;
  difficulty: GameDifficulty;
  mysteryItem: string;
  funFact: string;
  hints: GameHint[];
  maxGuesses: number;
  attempts: GuessAttempt[];
  solved: boolean;
  coaching: CoachResult | null;
}
