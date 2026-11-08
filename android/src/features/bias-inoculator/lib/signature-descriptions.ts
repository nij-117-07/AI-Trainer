// src/features/bias-inoculator/lib/signature-descriptions.ts
/**
 * Instruction and field descriptions for the Ax signature. The text is copied from the DSPy
 * signature in Backend/practice/bias_inoculator/services.py. Keys use the Ax field names; the
 * matching DSPy field is noted beside each key.
 */

export const BIAS_INOCULATOR_DESCRIPTIONS = {
  instruction:
    "Simulates a 'System 1 vs System 2' training session. Triggers a bias in the user, waits for their response, and then explains the logic.",
  inputs: {
    // conversation_history
    conversationHistory: "Previous scenarios or user reactions.",
    // target_bias
    targetBias: "Bias to train against. One of: anchoring, availability, confirmation, sunk_cost, framing.",
    // user_interest
    userInterest: "User's field (e.g., 'trading', 'dating', 'engineering').",
  },
  outputs: {
    // scenario_setup
    scenarioSetup: "A stealthy scenario that ends with a question for the user.",
    // intuitive_trap
    intuitiveTrap: "The 'gut feeling' or biased answer the user likely had.",
    // rational_analysis
    rationalAnalysis: "Detailed breakdown of how the bias works and what the rational path is.",
    // real_world_application
    realWorldApplication: "A practical tip for spotting this specific bias in their work/life.",
  },
};
