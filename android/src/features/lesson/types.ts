// src/features/lesson/types.ts

export interface LessonFormValues {
  nativeLanguage: string;
  targetLanguage: string;
  currentLevel: string;
  lastLessonSummary: string;
  learningFocus: string;
  complexityWeight: string;
  seed: string;
  userCustomInstruction: string;
}

export interface VocabularyEntry {
  word: string;
  ipa: string;
  translation: string;
  example: string;
}

export interface Lesson {
  header: string;
  comparativeAnalysis: string;
  deepDive: string;
  vocabulary: VocabularyEntry[];
  practice: string[];
  nuance: string;
  homework: string;
}
