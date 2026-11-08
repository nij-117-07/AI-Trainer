// src/features/lesson/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax lesson signature. The text is copied from
 * LanguageLessonGenerator in Backend/linguistic/lesson/services.py. Vocabulary sub-field
 * descriptions come from VocabularyItem in Backend/linguistic/lesson/schemas.py. Keys use the
 * camelCase Ax field names; the matching DSPy field is noted beside each key.
 */

export const LESSON_DESCRIPTIONS = {
  instruction:
    "You are an AI Polyglot Tutor. Your goal is to create a scaffolded learning experience by bridging the gap between the user's native language and their target language. Use the 'seed' to randomize vocabulary selection and 'user_custom_instruction' to wrap the lesson in a specific narrative or thematic shell (e.g., 'Interstellar Travel', 'Cooking', 'Classical Music').",
  inputs: {
    // native_language
    nativeLanguage: "The user's primary language for explanations and comparisons.",
    // target_language
    targetLanguage: "The language the user is currently learning.",
    // current_level
    currentLevel: "CEFR Proficiency level.",
    // last_lesson_summary
    lastLessonSummary: "Brief recap of previous concepts to ensure continuity.",
    // learning_focus (no DSPy desc; LessonRequest.learning_focus in schemas.py)
    learningFocus: "The pedagogical focus of the lesson.",
    // complexity_weight
    complexityWeight: "Determines the depth of explanation and number of exercises.",
    // seed
    seed: "A random string or number to ensure variety in examples.",
    // user_custom_instruction
    userCustomInstruction:
      "Thematic constraints (e.g., 'Cyberpunk setting', 'Business formal', 'Nature metaphors').",
  },
  outputs: {
    // lesson_header
    lessonHeader: "A creative title combining the target language and the custom theme.",
    // comparative_analysis
    comparativeAnalysis:
      "Explanation of how this concept differs from or relates to the user's native language.",
    // concept_deep_dive
    conceptDeepDive:
      "The core lesson content, explained clearly in the native language but using target language terminology.",
    // thematic_vocabulary
    thematicVocabulary:
      "List of 5-10 words in Target Language with [Word, IPA, Translation, Thematic Example Sentence].",
    // practice_suite
    practiceSuite: "A set of tiered exercises: 1. Recognition, 2. Transformation, 3. Creative Production.",
    // cultural_nuance
    culturalNuance:
      "An 'Insider Tip' about how native speakers actually use this concept in real life.",
    // homework_mission
    homeworkMission: "A real-world 'challenge' for the user to complete outside the app.",
  },
  vocabulary: {
    // VocabularyItem.word
    word: "The word in the target language",
    // VocabularyItem.ipa
    ipa: "International Phonetic Alphabet transcription",
    // VocabularyItem.translation
    translation: "Translation in the native language",
    // VocabularyItem.example
    example: "A thematic example sentence",
  },
};
