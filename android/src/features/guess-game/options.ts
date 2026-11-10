// src/features/guess-game/options.ts
/** Choices and limits for the Guess Game. Values match the webui options and the backend. */
import { type GameDifficulty, type GameSetupFormValues } from "./types";

export interface ChoiceOption {
  value: string;
  label: string;
}

export const CATEGORY_OPTIONS: ChoiceOption[] = [
  { value: "word", label: "Word" },
  { value: "movie", label: "Movie" },
  { value: "sentence", label: "Sentence" },
  { value: "book", label: "Book" },
  { value: "celebrity", label: "Celebrity" },
  { value: "song", label: "Song" },
];

export const DIFFICULTY_OPTIONS: ChoiceOption[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];

export const MAX_GUESSES_BY_DIFFICULTY: Record<GameDifficulty, number> = {
  easy: 10,
  medium: 7,
  hard: 5,
  expert: 3,
};

export const DEFAULT_FORM: GameSetupFormValues = {
  category: "word",
  difficulty: "medium",
  vocabularyTheme: "",
};

export const CATEGORY_MAX_LENGTH = 100;
export const THEME_MAX_LENGTH = 200;
export const GUESS_MAX_LENGTH = 200;
