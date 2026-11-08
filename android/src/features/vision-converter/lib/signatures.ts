// src/features/vision-converter/lib/signatures.ts
/**
 * Ax signature for the Vision Converter. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/tools/vision_converter/schemas.py.
 */
import { f } from "@ax-llm/ax";
import { IMAGE_TO_MARKDOWN_DESCRIPTIONS } from "./signature-descriptions";

const convert = IMAGE_TO_MARKDOWN_DESCRIPTIONS;

export const imageToMarkdownSignature = f()
  .description(convert.instruction)
  .input("sourceImage", f.image(convert.inputs.sourceImage))
  .input("userInstruction", f.string(convert.inputs.userInstruction).optional())
  .output("markdownOutput", f.string(convert.outputs.markdownOutput))
  .build();
