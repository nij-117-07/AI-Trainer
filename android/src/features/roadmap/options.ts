// src/features/roadmap/options.ts
/** Suggested dropdown presets and defaults for the roadmap form. Values match the webui options. */
import type { RoadmapFormValues } from "./types";

export interface ChoiceItem {
  value: string;
  label: string;
}

export const roadmapLevelOptions: ChoiceItem[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Professional", label: "Professional" },
  { value: "Expert", label: "Expert" },
];

export const roadmapModeOptions: ChoiceItem[] = [
  { value: "detailed", label: "Detailed" },
  { value: "short", label: "Short" },
];

export const roadmapPersonaStyleOptions: ChoiceItem[] = [
  { value: "industry expert", label: "Industry Expert" },
  { value: "academic", label: "Academic" },
  { value: "teacher", label: "Teacher" },
  { value: "friendly mentor", label: "Friendly Mentor" },
];

export const ROADMAP_FORM_DEFAULTS: RoadmapFormValues = {
  subject: "",
  startLevel: "Beginner",
  targetLevel: "Professional",
  mode: "detailed",
  personaStyle: "industry expert",
  userInstructions: "",
};
