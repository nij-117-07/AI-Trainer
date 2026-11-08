// src/features/diagram/lib/signatures.ts
/**
 * Ax signatures for the Diagram Generator. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/tools/diagram/services.py.
 */
import { f } from "@ax-llm/ax";
import { DRAWIO_GENERATOR_DESCRIPTIONS, MERMAID_GENERATOR_DESCRIPTIONS } from "./signature-descriptions";

const mermaid = MERMAID_GENERATOR_DESCRIPTIONS;
const drawio = DRAWIO_GENERATOR_DESCRIPTIONS;

export const mermaidGeneratorSignature = f()
  .description(mermaid.instruction)
  .input("userInstruction", f.string(mermaid.inputs.userInstruction))
  .input("context", f.string(mermaid.inputs.context).optional())
  .input("existingCode", f.string(mermaid.inputs.existingCode).optional())
  .output("updatedCode", f.string(mermaid.outputs.updatedCode))
  .output("answerMessage", f.string(mermaid.outputs.answerMessage))
  .build();

export const drawioGeneratorSignature = f()
  .description(drawio.instruction)
  .input("userInstruction", f.string(drawio.inputs.userInstruction))
  .input("context", f.string(drawio.inputs.context).optional())
  .input("existingCode", f.string(drawio.inputs.existingCode).optional())
  .output("updatedCode", f.string(drawio.outputs.updatedCode))
  .output("answerMessage", f.string(drawio.outputs.answerMessage))
  .build();
