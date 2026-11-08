// src/features/idioms/options.ts
/** Dropdown presets for the Idioms form. Values match the webui options and the backend enum. */
import type { SelectOption } from "@/components/tool/SelectField";

export const PROFICIENCY_OPTIONS: SelectOption[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "native-aspirant", label: "Native Aspirant" },
];

export const PROFICIENCY_LEVELS = ["beginner", "intermediate", "advanced", "native-aspirant"] as const;

export const IDIOMS_DEFAULTS = {
  targetLanguage: "French",
  nativeLanguage: "English",
  userProficiency: "intermediate",
  themeOrKeyword: "Success and Hard Work",
  seed: "",
  customUserRequest: "",
};
