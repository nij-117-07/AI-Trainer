// src/features/word-of-the-day/types.ts

export interface WordOfTheDayFormValues {
  targetLanguage: string;
  nativeLanguage: string;
  userProficiency: string;
  thematicFocus: string;
  customInstructions: string;
}

export interface WordOfTheDay {
  chosenWord: string;
  nativeTranslation: string;
  phoneticAndAudioGuide: string;
  morphologyBreakdown: string;
  primaryDefinition: string;
  theVibeCheck: string;
  historicalEvolution: string;
  modernUsageSentence: string;
  synonymWeb: string[];
}
