// src/features/socratic/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signature. The text is copied from the DSPy
 * signature in Backend/practice/socratic/services.py, so both stacks give the model the same
 * guidance. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const SOCRATIC_CHALLENGER_DESCRIPTIONS = {
  instruction:
    "Challenges user's reasoning rather than providing answers.\nTargets: Intellectual humility, logical consistency, and argumentation skills.\nContinuously probes the user's logic based on their current statement and past history.",
  inputs: {
    // conversation_history
    conversationHistory:
      "The log of previous exchanges to avoid repetition and deepen the challenge.",
    // user_statement
    userStatement: "The user's latest opinion or rebuttal.",
    // confidence_level
    confidenceLevel:
      "The user's perceived certainty in their current stance. One of: low, medium, high, certain.",
  },
  outputs: {
    // logical_fallacy_check
    logicalFallacyCheck:
      "If present, name the fallacy (e.g., Strawman, Ad Hominem); else 'None detected'.",
    // falsification_question
    falsificationQuestion:
      "A pithy question that asks: 'What evidence would prove you wrong?'",
    // edge_case_scenario
    edgeCaseScenario:
      "A 'What if...' scenario where the user's current logic leads to a contradiction.",
    // refined_perspective
    refinedPerspective:
      "A bridge: 'A more nuanced way to look at this might be...'",
  },
};
