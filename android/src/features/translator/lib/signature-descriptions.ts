// src/features/translator/lib/signature-descriptions.ts
/**
 * Instruction and field descriptions for the Translator Ax signature. The text is copied from
 * the DSPy ContextualTranslator signature in Backend/linguistic/translator/services.py, so both
 * stacks give the model the same guidance. The DSPy field name is noted beside each key.
 */

export const CONTEXTUAL_TRANSLATOR_DESCRIPTIONS = {
  instruction:
    "You are a Professional Linguist and Translator. Your goal is to translate text accurately while preserving the nuances of tone, cultural context, and specific user instructions.",
  inputs: {
    // text_to_translate
    textToTranslate: "The source text that needs translation.",
    // source_language
    sourceLanguage: "The language of the input text.",
    // target_language
    targetLanguage: "The language the text should be translated into.",
    // tone
    tone: "The desired style of the translation.",
    // custom_instructions
    customInstructions: "Specific rules (e.g., 'avoid gendered pronouns').",
  },
  outputs: {
    // rationale
    rationale: "Brief explanation of linguistic choices made for this translation.",
    // translated_text
    translatedText: "The final translated content.",
    // cultural_notes
    culturalNotes: "Notes on idioms or cultural adjustments made during translation.",
  },
};
