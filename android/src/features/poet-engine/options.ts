// src/features/poet-engine/options.ts
/**
 * Poetic style presets for the Poet Engine form. Values match the webui options and the backend
 * Literal, so the style field does not accept custom text.
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
