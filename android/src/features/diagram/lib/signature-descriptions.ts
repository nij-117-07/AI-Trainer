// src/features/diagram/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signatures. The text is copied from the DSPy
 * signatures in Backend/tools/diagram/services.py, so both stacks give the model the same
 * guidance. The matching DSPy field name is noted beside each key.
 */

export const MERMAID_GENERATOR_DESCRIPTIONS = {
  instruction:
    "You are an expert Mermaid.js developer. Your task is to generate or update Mermaid.js syntax for diagrams (flowcharts, sequence diagrams, class diagrams, etc.). Rules: 1. Return ONLY the Mermaid.js code in the 'updated_code' field. 2. If 'existing_code' is provided, modify it based on the instruction. 3. Ensure the syntax is correct and can be rendered by Mermaid loaders.",
  inputs: {
    // user_instruction
    userInstruction: "Specific visual change or diagram request.",
    // context
    context: "Business logic or technical context for the diagram content.",
    // existing_code
    existingCode: "Current Mermaid code to be refined.",
  },
  outputs: {
    // updated_code
    updatedCode:
      "The final valid Mermaid.js code starting with the diagram type (e.g., 'graph TD'). Do not include markdown code delimiters",
    // answer_message
    answerMessage: "A brief explanation of what was added or changed.",
  },
};

export const DRAWIO_GENERATOR_DESCRIPTIONS = {
  instruction:
    "You are an expert Draw.io (diagrams.net) architect. Your goal is to generate or edit XML/mxGraph code for diagrams based on user instructions. If 'existing_code' is provided, modify it according to the instructions. If 'existing_code' is empty, generate a new diagram from scratch. Ensure the XML is valid and compatible with Draw.io import.",
  inputs: {
    // user_instruction
    userInstruction: "What the user wants to build or change in the diagram.",
    // context
    context: "Background info about the system, flow, or business logic.",
    // existing_code
    existingCode: "The current Draw.io XML/mxGraph code to be edited.",
  },
  outputs: {
    // updated_code
    updatedCode: "The complete, valid Draw.io XML/mxGraph code. Do not include markdown code delimiters",
    // answer_message
    answerMessage: "A concise explanation of the changes or the logic used to build the diagram.",
  },
};
