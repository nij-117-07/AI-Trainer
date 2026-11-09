// src/features/dharma-instructor/lib/signatures.ts
/**
 * Ax signature for one turn with the Dharma instructor. Instructions and field descriptions live
 * in signature-descriptions.ts.
 */
import { f } from "@ax-llm/ax";
import { DHARMA_TURN_DESCRIPTIONS } from "./signature-descriptions";

const turn = DHARMA_TURN_DESCRIPTIONS;

export const dharmaTurnSignature = f()
  .description(turn.instruction)
  .input("message", f.string(turn.inputs.message))
  .input("history", f.string(turn.inputs.history))
  .output("reply", f.string(turn.outputs.reply))
  .output("dharmaTeaching", f.string(turn.outputs.dharmaTeaching))
  .output("reflectionPractice", f.string(turn.outputs.reflectionPractice))
  .build();
