// src/features/vision-converter/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signature. The text is copied from the DSPy
 * signature ImageToMarkdown in Backend/tools/vision_converter/schemas.py, so both stacks give
 * the model the same guidance. The DSPy field name is noted beside each key.
 */

export const IMAGE_TO_MARKDOWN_DESCRIPTIONS = {
  instruction:
    "You are a Vision-to-Markdown Expert. Analyze the provided image and convert its content into high-quality, well-structured Markdown. Maintain formatting like tables, headers, and lists.",
  inputs: {
    // image
    sourceImage: "The image object to be analyzed.",
    // user_instruction
    userInstruction: "Instructions on what to extract.",
  },
  outputs: {
    // markdown_output
    markdownOutput: "The complete converted Markdown string.",
  },
};
