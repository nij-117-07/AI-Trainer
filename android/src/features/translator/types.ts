// src/features/translator/types.ts

export interface TranslatorFormValues {
  textToTranslate: string;
  sourceLanguage: string;
  targetLanguage: string;
  tone: string;
  referenceMaterial: string;
  customInstructions: string;
}

export interface TranslationResponse {
  rationale: string;
  translatedText: string;
  culturalNotes: string;
}
