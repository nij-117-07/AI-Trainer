// src/features/guess-game/types.ts
/** Types for the Guess Game: form values, model results, and the game kept on the device. */

export const GAME_CATEGORIES = ["word", "movie", "sentence", "book", "celebrity", "song"] as const;
export type GameCategory = (typeof GAME_CATEGORIES)[number];

export const GAME_DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;
export type GameDifficulty = (typeof GAME_DIFFICULTIES)[number];

export interface GameSetupFormValues {
  category: GameCategory;
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

export interface GameMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GuessGameSession {
  category: GameCategory;
  difficulty: GameDifficulty;
  mysteryItem: string;
  funFact: string;
  hints: string[];
  maxGuesses: number;
  guesses: string[];
  solved: boolean;
  log: GameMessage[];
}
