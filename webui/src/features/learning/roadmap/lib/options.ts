// src/features/learning/roadmap/lib/options.ts
/**
 * Option lists and curated defaults for the Roadmap create form.
 */

export interface RoadmapOption {
  value: string;
  label: string;
}

export const roadmapLevelOptions: RoadmapOption[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "Professional", label: "Professional" },
  { value: "Expert", label: "Expert" },
];

export const roadmapModeOptions: RoadmapOption[] = [
  { value: "detailed", label: "Detailed" },
  { value: "short", label: "Short" },
];

export const roadmapPersonaStyleOptions: RoadmapOption[] = [
  { value: "industry expert", label: "Industry Expert" },
  { value: "academic", label: "Academic" },
  { value: "teacher", label: "Teacher" },
  { value: "friendly mentor", label: "Friendly Mentor" },
];

export const ROADMAP_DEFAULTS = {
  start_level: "Beginner",
  target_level: "Professional",
  mode: "detailed",
  persona_style: "industry expert",
  user_instructions: "",
};
