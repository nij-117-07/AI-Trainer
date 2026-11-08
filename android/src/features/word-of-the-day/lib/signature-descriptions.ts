// src/features/word-of-the-day/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Word of the Day Ax signature. The text is copied
 * from the DSPy signature WordOfTheDayExplorer in Backend/linguistic/word_of_the_day/services.py,
 * so both stacks give the model the same guidance. The matching DSPy field name is noted beside
 * each key. The DSPy user_proficiency input has no desc, so its text comes from the matching
 * WOTDRequest.proficiency field in schemas.py.
 */

export const WORD_OF_THE_DAY_DESCRIPTIONS = {
  instruction:
    "You are a Master Etymologist and Linguist. Your goal is to provide a 'Deep Dive' Word of the Day. You bridge the gap between ancient linguistic roots and modern-day usage, providing translations and context in the user's native language to deepen understanding.",
  inputs: {
    // date
    currentDate: "The current date (YYYY-MM-DD).",
    // target_language
    targetLanguage: "The language of the 'Word of the Day'.",
    // native_language
    nativeLanguage: "The user's primary language for explanations and translations.",
    // user_proficiency (no DSPy desc; from schemas.py WOTDRequest.proficiency)
    userProficiency: "Linguistic register of the explanation.",
    // thematic_focus
    thematicFocus: "Theme like 'Nature' or 'Technology'.",
    // seed
    dailySeed: "Entropy string for unique daily selection.",
    // user_custom_instructions
    userCustomInstructions: "e.g., 'Untranslatable words only'.",
  },
  outputs: {
    // word
    chosenWord: "The chosen word.",
    // native_translation
    nativeTranslation: "The closest equivalent in the user's native language.",
    // phonetic_and_audio_guide
    phoneticAndAudioGuide: "Pronunciation guide.",
    // morphology_breakdown
    morphologyBreakdown: "Etymological roots (Latin, Greek, etc.).",
    // primary_definition
    primaryDefinition: "Dictionary-style meaning in the native language.",
    // the_vibe_check
    theVibeCheck: "The 'feeling' and social context of the word.",
    // historical_evolution
    historicalEvolution: "How the meaning has shifted over the centuries.",
    // modern_usage_sentence
    modernUsageSentence: "Example sentence in target language with native translation.",
    // synonym_web
    synonymWeb: "3-5 related words or concepts.",
  },
};
