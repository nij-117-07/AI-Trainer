// src/features/explainer/options.ts
/** Suggested dropdown presets. Values match the webui options; "Custom" accepts any text. */

export interface ChoiceItem {
  value: string;
  label: string;
}

export const expertiseLevelOptions: ChoiceItem[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
];

export const explanationStyleOptions: ChoiceItem[] = [
  { value: "academic", label: "Academic" },
  { value: "practical", label: "Practical" },
  { value: "with examples", label: "With Examples" },
];

export const roadmapStyleOptions: ChoiceItem[] = [
  { value: "academic", label: "Academic" },
  { value: "practical", label: "Practical" },
  { value: "with examples", label: "With Examples" },
  { value: "conceptual", label: "Conceptual" },
];

export const userLevelOptions: ChoiceItem[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

export const questionCategoryOptions: ChoiceItem[] = [
  { value: "conceptual-bridge", label: "Conceptual Bridge" },
  { value: "counterfactual", label: "Counterfactual" },
  { value: "first-principles", label: "First Principles" },
  { value: "applied-case-study", label: "Applied Case Study" },
  { value: "reductio-ad-absurdum", label: "Reductio ad Absurdum" },
];
