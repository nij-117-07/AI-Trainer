// src/features/puzzle/options.ts
/**
 * Dropdown presets and defaults for the Puzzle Generator. Values match the webui options. The
 * dropdowns also accept custom text, which is sent to the model as written.
 */
import type { CognitiveDomain, DifficultyLevel, PuzzleFormValues, PuzzleType } from "./types";

export interface PuzzleChoice<T extends string> {
  value: T;
  label: string;
}

export const PUZZLE_TYPE_OPTIONS: PuzzleChoice<PuzzleType>[] = [
  { value: "riddle", label: "Riddle" },
  { value: "logic grid", label: "Logic Grid" },
  { value: "sequence", label: "Sequence" },
  { value: "wordplay", label: "Wordplay" },
  { value: "cipher", label: "Cipher" },
];

export const COGNITIVE_DOMAIN_OPTIONS: PuzzleChoice<CognitiveDomain>[] = [
  { value: "verbal", label: "Verbal" },
  { value: "mathematical", label: "Mathematical" },
  { value: "spatial", label: "Spatial" },
  { value: "lateral", label: "Lateral" },
];

export const DIFFICULTY_OPTIONS: PuzzleChoice<DifficultyLevel>[] = [
  { value: "novice", label: "Novice" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
  { value: "genius", label: "Genius" },
];

export const DEFAULT_PUZZLE_FORM: PuzzleFormValues = {
  fieldOfInterest: "",
  puzzleType: "logic grid",
  targetDomain: "lateral",
  difficultyLevel: "intermediate",
  userInstructions: "",
};
