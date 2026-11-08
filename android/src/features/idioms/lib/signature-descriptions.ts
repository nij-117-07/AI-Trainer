// src/features/idioms/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Idioms Ax signature. The text is copied from the
 * DSPy signature IdiomsHelper in Backend/linguistic/idioms/services.py, so both stacks give the
 * model the same guidance. The matching DSPy field name is noted beside each key.
 */

export const IDIOM_LESSON_DESCRIPTIONS = {
  instruction:
    "You are an Expert Polyglot and Philologist. Your mission is to help users master idiomatic expressions across different languages. Use the 'seed' to rotate through different idioms for the same topic. Incorporate the 'custom_user_request' to tailor the tone, complexity, or specific niche.",
  inputs: {
    // target_language
    targetLanguage: "The language the user wants to learn (e.g., Spanish, Mandarin).",
    // user_proficiency
    userProficiency: "Current level of the user.",
    // theme_or_keyword
    themeOrKeyword: "The general topic (e.g., 'Time', 'Money', 'Health').",
    // native_language
    nativeLanguage: "The user's primary language for explanations.",
    // seed
    seed: "A unique string to ensure variety in idiom selection.",
    // custom_user_request
    customUserRequest: "Specific user preferences (e.g., 'make it funny', 'business context only').",
  },
  outputs: {
    // rationale
    rationale: "Reasoning for selecting this specific idiom based on the seed and user request.",
    // idiom_in_target_language
    idiomInTargetLanguage: "The idiom written in the target language.",
    // phonetic_pronunciation
    phoneticPronunciation: "How to say it (IPA or phonetic spelling).",
    // figurative_meaning
    figurativeMeaning: "The actual meaning interpreted in the native language.",
    // cultural_context
    culturalContext: "The 'Why' and 'When' - historical origin or social setting.",
    // equivalent_in_native_language
    equivalentInNativeLanguage: "A matching idiom in the user's native tongue.",
    // dialogue_scenario
    dialogueScenario: "A short script showing the idiom in use.",
    // practice_prompt
    practicePrompt: "A question asking the user to use the idiom in a new sentence.",
  },
};
