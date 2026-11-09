// src/features/prompt-refiner/types.ts

export interface PromptRefinerFormValues {
  originalPrompt: string;
  goal: string;
  constraints: string;
}

export interface PromptRefinerResult {
  refinedPrompt: string;
  changes: string[];
  clarifyingQuestions: string[];
}
