// src/features/practice/guess-game/lib/options.ts
/**
 * Form options for the Guess Game.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const categoryOptions: FieldOption[] = [
  { value: "word", label: "Word" },
  { value: "movie", label: "Movie" },
  { value: "sentence", label: "Sentence" },
  { value: "book", label: "Book" },
  { value: "celebrity", label: "Celebrity" },
  { value: "song", label: "Song" },
];

export const difficultyOptions: FieldOption[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];
