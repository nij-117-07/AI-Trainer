// src/features/idioms/types.ts

export interface IdiomsFormValues {
  targetLanguage: string;
  nativeLanguage: string;
  userProficiency: string;
  themeOrKeyword: string;
  seed: string;
  customUserRequest: string;
}

export interface IdiomLesson {
  rationale: string;
  idiomInTargetLanguage: string;
  phoneticPronunciation: string;
  figurativeMeaning: string;
  culturalContext: string;
  equivalentInNativeLanguage: string;
  dialogueScenario: string;
  practicePrompt: string;
}
