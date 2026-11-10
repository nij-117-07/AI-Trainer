// src/features/rewriter/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signature. The text is copied from the DSPy
 * signature in Backend/linguistic/rewriter/services.py, so both stacks give the model the same
 * guidance. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const TEXT_REWRITER_DESCRIPTIONS = {
  instruction:
    "You are an Expert Content Editor and Copywriter. Your task is to rewrite the provided text to improve its quality, adjust its tone, or change its structure while preserving the original intent.",
  inputs: {
    // original_text
    originalText: "The text that needs to be rewritten.",
    // target_tone
    targetTone:
      "Desired tone (e.g., professional, witty, empathetic, concise).",
    // audience
    audience: "Who the text is being written for.",
    // transformation_goal
    transformationGoal:
      "The primary objective of the rewrite. Preset goals: paraphrase, shorten, expand, simplify. Any other goal is also accepted.",
    // custom_instructions
    customInstructions: "Specific constraints or rules.",
  },
  outputs: {
    // rationale
    rationale: "Explanation of the stylistic changes made.",
    // rewritten_text
    rewrittenText: "The final polished version of the text.",
    // improvements_made
    improvementsMade:
      "A list of specific changes (e.g., 'Removed passive voice').",
  },
};
