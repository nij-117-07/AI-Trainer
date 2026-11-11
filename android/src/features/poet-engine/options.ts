// src/features/poet-engine/options.ts
/**
 * Poetic style presets for the Poet Engine form. Values match the webui options. The form also
 * accepts a custom style, which the signature treats as a suggestion, not a fixed list.
 */
import type { SelectOption } from "@/components/tool/SelectField";

export const POETIC_STYLES = [
  "Shayari/Couplet",
  "Haiku",
  "Metaphorical Prose",
  "Ghazal-style",
] as const;

export const POETIC_STYLE_OPTIONS: SelectOption[] = [
  { value: "Shayari/Couplet", label: "Shayari / Couplet" },
  { value: "Haiku", label: "Haiku" },
  { value: "Metaphorical Prose", label: "Metaphorical Prose" },
  { value: "Ghazal-style", label: "Ghazal-style" },
];

/** Mood presets from the webui placeholder. The first one is the backend default. */
export const POET_MOOD_OPTIONS: SelectOption[] = [
  { value: "mystical", label: "Mystical" },
  { value: "melancholic", label: "Melancholic" },
  { value: "joyful", label: "Joyful" },
];
