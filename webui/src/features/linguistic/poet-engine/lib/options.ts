// src/features/linguistic/poet-engine/lib/options.ts
/**
 * Form option lists for the Poet Engine tool.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const poeticStyleOptions: FieldOption[] = [
  { value: "Shayari/Couplet", label: "Shayari / Couplet" },
  { value: "Haiku", label: "Haiku" },
  { value: "Metaphorical Prose", label: "Metaphorical Prose" },
  { value: "Ghazal-style", label: "Ghazal-style" },
];
