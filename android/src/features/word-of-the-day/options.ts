// src/features/word-of-the-day/options.ts
/** Dropdown presets for the Word of the Day form. Values match the webui options and the backend enum. */
import type { SelectOption } from "@/components/tool/SelectField";

export const PROFICIENCY_OPTIONS: SelectOption[] = [
  { value: "basic", label: "Basic" },
  { value: "academic", label: "Academic" },
  { value: "poetic", label: "Poetic" },
  { value: "slang", label: "Slang" },
];

export const PROFICIENCY_LEVELS = ["basic", "academic", "poetic", "slang"] as const;

export const WORD_OF_THE_DAY_DEFAULTS = {
  targetLanguage: "Japanese",
  nativeLanguage: "English",
  userProficiency: "academic",
  thematicFocus: "",
  customInstructions: "",
};
