// src/features/sentence-of-the-day/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax sentence signature. The text is copied from
 * SentenceOfTheDaySignature in Backend/linguistic/sentence_of_the_day/services.py. Keys use the
 * camelCase Ax field names; the matching DSPy field is noted beside each key.
 */

export const SENTENCE_DESCRIPTIONS = {
  instruction:
    "You are a Cultural Linguistic Guide. Your goal is to provide a 'Sentence of the Day' that captures the soul of the target language. You focus on idiomatic expressions, proverbs, or sophisticated conversational structures that don't always translate literally.",
  inputs: {
    // date (renamed sentenceDate: Ax rejects the generic name "date")
    sentenceDate: "YYYY-MM-DD",
    // target_language
    targetLanguage: "The language the user is learning.",
    // native_language
    nativeLanguage: "The user's primary language.",
    // context_setting (no DSPy desc; SentenceRequest.context_setting in schemas.py)
    contextSetting: "The situational setting of the sentence.",
    // complexity_level (no DSPy desc; SentenceRequest.complexity_level in schemas.py)
    complexityLevel: "The proficiency level of the sentence.",
    // seed
    seed: "Entropy string for variety.",
  },
  outputs: {
    // target_sentence
    targetSentence: "The sentence in the target language.",
    // literal_translation
    literalTranslation: "Word-for-word translation in native language.",
    // natural_translation
    naturalTranslation: "The equivalent 'meaning-based' translation in native language.",
    // grammatical_highlight
    grammaticalHighlight: "Explanation of a specific rule or tense used in the sentence.",
    // cultural_context
    culturalContext:
      "Where and why a native would say this. Any hidden social taboos or nuances.",
    // substitution_options
    substitutionOptions: "2-3 variations of the sentence by changing one key word.",
  },
};
