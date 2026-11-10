// src/features/translator/types.ts

export interface TranslatorFormValues {
  textToTranslate: string;
  tone: string;
  customInstructions: string;
}

export interface TranslatorRequest extends TranslatorFormValues {
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationResponse {
  rationale: string;
  translatedText: string;
  culturalNotes: string;
}
