// src/features/practice/clarity-trainer/lib/options.ts
/**
 * Form options for the Clarity Trainer.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const difficultyOptions: FieldOption[] = [
  { value: "random", label: "Random" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "advanced", label: "Advanced" },
];

export const categoryOptions: FieldOption[] = [
  { value: "random", label: "Random" },
  { value: "team update", label: "Team Update" },
  { value: "giving feedback", label: "Giving Feedback" },
  { value: "difficult conversation", label: "Difficult Conversation" },
  { value: "pitch or ask", label: "Pitch or Ask" },
  { value: "status report", label: "Status Report" },
  { value: "conflict resolution", label: "Conflict Resolution" },
  { value: "presentation opening", label: "Presentation Opening" },
  { value: "email", label: "Email" },
  { value: "negotiation", label: "Negotiation" },
  { value: "apology", label: "Apology" },
];
