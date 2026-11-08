// src/features/riddle/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signatures. The text is copied from the DSPy
 * signatures in Backend/practice/riddle/services.py, so both stacks give the model the same
 * guidance. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const ADAPTIVE_RIDDLE_DESCRIPTIONS = {
  instruction:
    "Generates personalized riddles that adapt to the user's cognitive level.\nUses a seed for variability to ensure unique puzzles.",
  inputs: {
    // field_of_interest
    fieldOfInterest: "The topic (e.g. Space, History).",
    // target_domain
    targetDomain: "Cognitive domain. One of: verbal, mathematical, spatial, lateral.",
    // difficulty_level
    difficultyLevel: "Difficulty tier. One of: novice, intermediate, expert, genius.",
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
