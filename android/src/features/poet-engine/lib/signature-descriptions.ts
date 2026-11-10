// src/features/poet-engine/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signature. The text is copied from the DSPy
 * signature in Backend/linguistic/poet_engine/services.py, so both stacks give the model the same
 * guidance. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const POETIC_LANGUAGE_EXPLAINER_DESCRIPTIONS = {
  instruction:
    "You are a Poetic Philologist and Sufi-inspired Linguist. Your goal is to bridge cultural gaps by explaining the 'Soul' of a word. You translate not just words, but the historical and emotional weight they carry, adapting the explanation to the user's native language.",
  inputs: {
    // target_language
    targetLanguage:
      "The source language of the concept (e.g., Urdu, Persian, Japanese).",
    // native_language
    nativeLanguage:
      "The user's primary language for the explanation and translation.",
    // concept_word
    conceptWord:
      "The specific word or abstract concept (e.g., 'Ishq', 'Wabi-sabi').",
    // poetic_style (no DSPy description; the allowed values are listed here instead)
    poeticStyle:
      "The poetic form used for the generation. Preset forms: Shayari/Couplet, Haiku, Metaphorical Prose, Ghazal-style. Any other poetic form is also accepted.",
    // user_mood
    userMood: "The emotional tone for the generation.",
    // user_custom_instruction
    userCustomInstruction:
      "Specific constraints like nature metaphors or urban settings.",
  },
  outputs: {
    // etymological_soul
    etymologicalSoul: "The cultural and historical origin of the word.",
    // original_poetry
    originalPoetry: "The poetic piece in the target_language.",
    // soulful_translation
    soulfulTranslation: "A deep translation into the user's native_language.",
    // philosophical_reflection
    philosophicalReflection:
      "Connection of the word to the universal human experience.",
    // visual_metaphor
    visualMetaphor: "A vivid description of a scene representing this concept.",
  },
};
