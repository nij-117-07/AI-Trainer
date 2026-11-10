// src/features/riddle/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signatures. The text starts from the DSPy
 * signatures in Backend/practice/riddle/services.py. The domain and difficulty descriptions, and
 * the user_instructions input, are Android-only: custom choices and extra instructions are
 * allowed here. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const ADAPTIVE_RIDDLE_DESCRIPTIONS = {
  instruction:
    "Generates personalized riddles that adapt to the user's cognitive level.\nUses a seed for variability to ensure unique puzzles.",
  inputs: {
    // field_of_interest
    fieldOfInterest: "The topic (e.g. Space, History).",
    // target_domain
    targetDomain:
      "Cognitive domain, such as verbal, mathematical, spatial, or lateral. Other domains the user names are also valid.",
    // difficulty_level
    difficultyLevel:
      "Difficulty tier, such as novice, intermediate, expert, or genius. Other levels the user names are also valid.",
    // user_instructions
    userInstructions:
      "Optional extra instructions from the user, such as style, length, or constraints. Follow them when they do not conflict with the riddle rules.",
    // seed
    seed: "A random seed for variety.",
  },
  outputs: {
    // riddle_text
    riddleText: "The riddle/puzzle text.",
    // solution
    solution: "Clear explanation of the logic.",
    // cognitive_trigger
    cognitiveTrigger: "The mental hook being trained.",
  },
};

export const RIDDLE_EVALUATOR_DESCRIPTIONS = {
  instruction: "Evaluates the user's answer. Determines correctness and provides feedback.",
  inputs: {
    // riddle_text
    riddleText: "The original riddle.",
    // solution
    solution: "The correct answer.",
    // user_answer
    userAnswer: "The user's attempt or request for help.",
  },
  outputs: {
    // is_correct
    isCorrect: "True if the answer is logically correct.",
    // feedback
    feedback: "Feedback or a hint if incorrect. Do not reveal the answer.",
    // thought_redirection
    thoughtRedirection: "Instruction on how to shift their perspective.",
  },
};
