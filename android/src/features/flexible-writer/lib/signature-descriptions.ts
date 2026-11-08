// src/features/flexible-writer/lib/signature-descriptions.ts
/**
 * Instruction and field descriptions for the Flexible Writer Ax signature. The text is copied from
 * the FlexibleWriter DSPy signature in Backend/tools/flexible_writer/services.py. Keys use the Ax
 * field names; the matching DSPy field is noted beside each key.
 */

export const FLEXIBLE_WRITER_DESCRIPTIONS = {
  instruction:
    "You are an adaptable AI agent. Use the provided System Prompt to determine your persona and behavioral constraints. Process the input data according to the user's specific instructions.",
  inputs: {
    // system_prompt
    systemPrompt: "The core persona and rules for the AI.",
    // input_data
    inputData: "The primary data/content to be processed or transformed.",
    // additional_user_input
    additionalUserInput: "Specific instructions or context from the user.",
  },
  outputs: {
    // answer_message
    answerMessage: "A conversational summary of what was done.",
    // updated_data
    updatedData: "The structured result or transformed version of the input data.",
  },
};
