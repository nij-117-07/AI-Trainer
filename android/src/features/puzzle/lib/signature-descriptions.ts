// src/features/puzzle/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signatures. The text starts from the DSPy
 * signatures in Backend/practice/puzzle/services.py. The choice descriptions and the
 * user_instructions input are Android-only: custom choices and extra instructions are allowed here.
 * Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const ADAPTIVE_PUZZLE_DESCRIPTIONS = {
  instruction:
    "Generates highly personalized puzzles and brain teasers. The agent adapts the complexity and logic style based on the target domain, puzzle type, and difficulty tier to provide a tailored cognitive challenge.",
  inputs: {
    // field_of_interest
    fieldOfInterest: "The thematic topic (e.g., Cyberpunk, Ancient Egypt, Quantum Physics).",
    // puzzle_type
    puzzleType:
      "The specific format of the puzzle, such as riddle, logic grid, sequence, wordplay, or cipher. Other formats the user names are also valid.",
    // target_domain
    targetDomain:
      "The primary cognitive skill the puzzle should exercise, such as verbal, mathematical, spatial, or lateral. Other skills the user names are also valid.",
    // difficulty_level
    difficultyLevel:
      "The depth of reasoning required to solve the puzzle, such as novice, intermediate, expert, or genius. Other levels the user names are also valid.",
    // user_instructions
    userInstructions:
      "Optional extra instructions from the user, such as style, length, or constraints. Follow them when they do not conflict with the puzzle rules.",
    // seed
    seed: "A numerical seed to ensure variety and uniqueness in generation.",
  },
  outputs: {
    // puzzler_persona
    puzzlerPersona: "A short flavor-text description of the entity presenting the puzzle.",
    // puzzle_text
    puzzleText: "The actual content of the puzzle or brain teaser.",
    // solution
    solution: "The correct answer with a step-by-step logical breakdown.",
    // cognitive_trigger
    cognitiveTrigger: "Analysis of the mental 'trap' or insight required to solve it.",
  },
};

export const PUZZLE_EVALUATOR_DESCRIPTIONS = {
  instruction:
    "Evaluates a user's response to a puzzle. It determines logical correctness, calculates how close the user was, and provides targeted hints without spoiling the solution.",
  inputs: {
    // puzzle_context
    puzzleContext: "The full text of the puzzle/challenge.",
    // puzzle_type
    puzzleType: "The type of puzzle (e.g., cipher, logic grid, sequence).",
    // official_solution
    officialSolution: "The factual correct answer and logic.",
    // user_response
    userResponse: "The user's input, answer, or query.",
  },
  outputs: {
    // is_correct
    isCorrect: "Boolean indicating if the answer matches the solution's logic.",
    // accuracy_score
    accuracyScore: "A score from 0.0 to 1.0 representing how close the user was.",
    // evaluation_feedback
    evaluationFeedback: "Encouraging feedback. If wrong, point out the logical flaw.",
    // hint_redirection
    hintRedirection: "A nudge toward the right path. Only provide if is_correct is False.",
    // metacognitive_prompt
    metacognitivePrompt: "A question to help the user rethink their approach.",
  },
};
