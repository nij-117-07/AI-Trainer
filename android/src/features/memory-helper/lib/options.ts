// src/features/memory-helper/lib/options.ts
/** Dropdown presets for the mnemonic technique. These match the webui options. */
import type { SelectOption } from "@/components/tool/SelectField";
import { MEMORY_TECHNIQUES } from "./types";

export const techniqueOptions: SelectOption[] = MEMORY_TECHNIQUES.map((technique) => ({
  value: technique,
  label: technique,
}));
