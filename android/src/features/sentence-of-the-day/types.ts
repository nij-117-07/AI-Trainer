// src/features/sentence-of-the-day/types.ts

export interface SentenceFormValues {
  targetLanguage: string;
  nativeLanguage: string;
  contextSetting: string;
  complexityLevel: string;
}

export interface SentenceOfTheDay {
  date: string;
  targetSentence: string;
  literalTranslation: string;
  naturalTranslation: string;
  grammaticalHighlight: string;
  culturalContext: string;
  substitutionOptions: string[];
}
