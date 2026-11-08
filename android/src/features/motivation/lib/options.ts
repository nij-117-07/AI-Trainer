// src/features/motivation/lib/options.ts
/** Dropdown presets for the quote style. These match the webui options. */
import type { SelectOption } from "@/components/tool/SelectField";

export const quoteStyleOptions: SelectOption[] = [
  { value: "stoic", label: "Stoic" },
  { value: "modern", label: "Modern" },
  { value: "poetic", label: "Poetic" },
  { value: "tough-love", label: "Tough Love" },
];
