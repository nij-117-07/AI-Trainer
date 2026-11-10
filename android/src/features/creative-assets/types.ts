// src/features/creative-assets/types.ts

export interface CreativeAssetsFormValues {
  taskType: string;
  userQuery: string;
  context: string;
  referenceExamples: string;
  numberOfSuggestions: number;
}

/** One suggestion as the model returns it. */
export interface CreativeSuggestion {
  suggestion: string;
  explanation: string;
}

/** One suggestion in the list, with its own id and whether the user ticked it. */
export interface CreativeListItem extends CreativeSuggestion {
  id: string;
  liked: boolean;
}

export interface CreativeBatch {
  id: string;
  label: string;
  items: CreativeListItem[];
}

export interface CreativeAssetsResult {
  form: CreativeAssetsFormValues;
  /** How many rounds have been generated, including rounds whose items were later removed. */
  rounds: number;
  batches: CreativeBatch[];
}

export interface CreativeMoreInput {
  taskType: string;
  userQuery: string;
  context: string;
  numberOfSuggestions: number;
  likedSuggestions: string[];
  userInstructions: string;
}
