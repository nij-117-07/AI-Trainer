// src/features/translator/options.ts
/**
 * Tone presets for the Translator form. Values match the webui options and the backend enum, so
 * the field does not accept custom text.
 */

export const TONE_OPTIONS = [
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "business", label: "Business" },
  { value: "poetic", label: "Poetic" },
  { value: "technical", label: "Technical" },
];

export const TONES = ["formal", "casual", "business", "poetic", "technical"] as const;

export const TRANSLATOR_STORAGE_KEY = "language-learner.translator.process.v1";

export const TRANSLATOR_DEFAULTS = {
  textToTranslate: "The early bird catches the worm.",
  sourceLanguage: "English",
  targetLanguage: "Japanese",
  tone: "formal",
  referenceMaterial: "",
  customInstructions: "",
};
