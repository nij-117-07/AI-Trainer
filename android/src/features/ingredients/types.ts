// src/features/ingredients/types.ts
import type { ImageInput } from "@/lib/image";
import type { Tone } from "@/theme";

export type HealthLevel = 1 | 2 | 3 | 4 | 5;

export interface IngredientsFormValues {
  manualText: string;
}

export interface IngredientsCheckInput extends IngredientsFormValues {
  image: ImageInput | null;
}

export interface IngredientAnalysis {
  extractedIngredients: string[];
  healthLevel: HealthLevel;
  riskFactors: string[];
  summaryAnalysis: string;
}

export interface HealthLevelInfo {
  label: string;
  description: string;
  tone: Tone;
}
