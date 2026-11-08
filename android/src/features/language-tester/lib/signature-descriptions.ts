// src/features/language-tester/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signatures. The text is copied from the DSPy
 * signatures in Backend/linguistic/language_tester/services.py, so both stacks give the model the
 * same guidance. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const LANGUAGE_MCQ_DESCRIPTIONS = {
  instruction:
    "You are an Adaptive Language Examiner. Generate a specific number of Multiple Choice Questions (MCQs) to evaluate proficiency in a target language. Scale the vocabulary and grammar complexity strictly according to the CEFR level provided.",
  inputs: {
    // target_language
    targetLanguage: "The language being tested (e.g., Italian, Korean).",
    // native_language
    nativeLanguage: "The user's native language for explanations and reference.",
    // level
    level: "CEFR proficiency level.",
    // num_questions
    numQuestions: "The total number of questions to generate.",
    // scenario
    scenario: "Context for questions (e.g., 'Ordering at a restaurant', 'Business meeting').",
    // user_details
    userDetails: "Persona info to personalize the questions.",
    // seed
    seed: "A unique string/number to ensure different questions on every run.",
    // custom_instructions
    customInstructions: "Specific focus (e.g., 'only use past tense', 'no formal pronouns').",
  },
  outputs: {
    // level_rationale
    levelRationale: "Briefly explain why these questions fit the requested CEFR level.",
    // assessment_title
    assessmentTitle: "A creative title for this specific test set.",
    // questions
    questions:
      "A list of MCQ objects. Each object must contain: 'id': unique question ID; 'text': The question; 'options': {'A': '...', 'B': '...', 'C': '...', 'D': '...'}; 'correct': The letter (A, B, C, or D); 'explanation': Why the answer is correct (in the native language).",
  },
};

export const FILL_IN_BLANK_DESCRIPTIONS = {
  instruction:
    "You are a Language Tutor. Generate 'Fill in the Blank' sentences. The sentence should have one clear missing part (indicated by '____'). Tailor the vocabulary to the user's profile and CEFR level.",
  inputs: {
    // target_language
    targetLanguage: "The language to practice.",
    // level (no description in the DSPy field)
    level: "CEFR proficiency level.",
    // num_questions
    numQuestions: "Number of sentences to generate.",
    // scenario
    scenario: "Context (e.g., 'At the Pharmacy', 'Office Gossip').",
    // user_details
    userDetails: "User's background to make sentences relatable.",
    // seed
    seed: "Seed for randomness.",
  },
  outputs: {
    // questions
    questions:
      "List of objects: 'sentence': The sentence with '____'; 'correct_word': The missing word/phrase; 'hint': A clue in the target language; 'context_clue': Translation of the sentence in the native language.",
  },
};

export const WORD_EVALUATOR_DESCRIPTIONS = {
  instruction:
    "You are a Linguistic Grader. Compare the User's Answer with the Correct Word. Determine if it is Correct, Incorrect, or 'Close' (Typo/Partial). Provide grammatical feedback.",
  inputs: {
    // sentence_context
    sentenceContext: "The full sentence where the word fits.",
    // correct_word
    correctWord: "The expected answer.",
    // user_answer
    userAnswer: "What the user typed.",
  },
  outputs: {
    // is_correct
    isCorrect: "True if the answer is functionally correct.",
    // status (no description in the DSPy field)
    status: "The evaluation verdict.",
    // feedback
    feedback: "Brief explanation of the mistake or praise.",
    // improvement_tip
    improvementTip: "Grammar rule related to this specific error.",
  },
};

export const TRANSLATION_CHALLENGE_DESCRIPTIONS = {
  instruction:
    "You are a Bilingual Assessment Expert. Generate a translation challenge that tests either 'Active Production' (Native to Target) or 'Passive Recognition' (Target to Native). The challenge must be contextually relevant to the user's scenario and level.",
  inputs: {
    // target_language
    targetLanguage: "The language the user is learning.",
    // native_language
    nativeLanguage: "The user's primary language.",
    // level (no description in the DSPy field)
    level: "CEFR proficiency level.",
    // scenario
    scenario: "Setting (e.g., 'Navigating a Train Station', 'Technical Brainstorming').",
    // user_persona
    userPersona: "Who the user is (e.g., 'Student', 'CEO', 'Tourist').",
    // test_type
    testType: "Direction of the test: Native->Target, Target->Native, or explaining nuance.",
    // seed
    seed: "Randomness seed to vary the sentences.",
    // custom_instructions
    customInstructions: "e.g., 'use informal pronouns', 'focus on medical terms'.",
  },
  outputs: {
    // challenge_instruction
    challengeInstruction: "Specific instruction for the user (e.g., 'Translate this to Spanish').",
    // source_text
    sourceText: "The text provided to the user to process.",
    // correct_reference
    correctReference: "The ideal translation or explanation.",
    // vocabulary_highlights
    vocabularyHighlights: "Key words to pay attention to in this challenge.",
    // cultural_tip
    culturalTip: "A note on why this specific phrasing is used in the target culture.",
  },
};

export const ROLEPLAY_CHAT_DESCRIPTIONS = {
  instruction:
    "You are a Language Immersion Coach. Your goal is to sustain a realistic conversation in the Target Language. You act as a specific character (e.g., a grumpy waiter, a helpful doctor). You must evaluate the user's response for fluency while keeping the conversation moving forward naturally.",
  inputs: {
    // target_language
    targetLanguage: "Language of the conversation.",
    // level (no description in the DSPy field)
    level: "CEFR proficiency level.",
    // scenario
    scenario: "Setting (e.g., 'At a Police Station reporting a lost bag').",
    // user_persona
    userPersona: "The role the user is playing.",
    // chat_history
    chatHistory: "The previous turns of the conversation.",
    // user_latest_response
    userLatestResponse: "The user's most recent chat message.",
    // seed
    seed: "Seed to determine the AI character's personality.",
  },
  outputs: {
    // linguistic_critique
    linguisticCritique: "Feedback on user's grammar/vocabulary in the latest turn.",
    // fluency_score
    fluencyScore: "1-10 score of the user's latest response.",
    // ai_character_response
    aiCharacterResponse: "The AI's next line in character (Target Language).",
    // suggested_strategies
    suggestedStrategies: "Ways the user could have phrased things better.",
    // is_goal_achieved
    isGoalAchieved: "Has the user successfully completed the scenario goal?",
  },
};
