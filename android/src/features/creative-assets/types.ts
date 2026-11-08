// src/features/creative-assets/types.ts

export interface CreativeAssetsFormValues {
  taskType: string;
  userQuery: string;
  context: string;
  referenceExamples: string;
  numberOfSuggestions: number;
}

export interface CreativeSuggestion {
  suggestion: string;
  explanation: string;
}

export interface CreativeAssetsResult {
  suggestions: CreativeSuggestion[];
}
