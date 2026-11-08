// src/features/flexible-writer/lib/signatures.ts
/**
 * Ax signature for the Flexible Writer. Instructions and field descriptions live in
 * signature-descriptions.ts. The DSPy `Any` fields are sent and returned as text, because Ax
 * JSON outputs reject plain prose.
 */
import { f } from "@ax-llm/ax";
import { FLEXIBLE_WRITER_DESCRIPTIONS } from "./signature-descriptions";

const desc = FLEXIBLE_WRITER_DESCRIPTIONS;

export const flexibleWriterSignature = f()
  .description(desc.instruction)
  .input("systemPrompt", f.string(desc.inputs.systemPrompt))
  .input("inputData", f.string(desc.inputs.inputData))
  .input("additionalUserInput", f.string(desc.inputs.additionalUserInput).optional())
  .output("answerMessage", f.string(desc.outputs.answerMessage))
  .output("updatedData", f.string(desc.outputs.updatedData))
  .build();
