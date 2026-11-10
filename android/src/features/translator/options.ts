// src/features/translator/options.ts
/**
 * Tone presets for the Translator form. Values match the webui options. The form also accepts a
 * custom tone, which the signature treats as a suggestion, not a fixed list.
 */

export const TONE_OPTIONS = [
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "business", label: "Business" },
  { value: "poetic", label: "Poetic" },
  { value: "technical", label: "Technical" },
];

export const TRANSLATOR_STORAGE_KEY = "language-learner.translator.process.v1";

export const TRANSLATOR_DEFAULTS = {
  textToTranslate: "",
  tone: "formal",
  customInstructions: "",
};
