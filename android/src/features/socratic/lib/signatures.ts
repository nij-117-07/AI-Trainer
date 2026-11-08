// src/features/socratic/lib/signatures.ts
/**
 * Ax signature for the Socratic Challenger. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/socratic/services.py.
 */
import { f } from "@ax-llm/ax";
import { SOCRATIC_CHALLENGER_DESCRIPTIONS } from "./signature-descriptions";

const challenger = SOCRATIC_CHALLENGER_DESCRIPTIONS;

export const socraticChallengerSignature = f()
  .description(challenger.instruction)
  .input("conversationHistory", f.string(challenger.inputs.conversationHistory))
  .input("userStatement", f.string(challenger.inputs.userStatement))
  .input("confidenceLevel", f.string(challenger.inputs.confidenceLevel))
  .output("logicalFallacyCheck", f.string(challenger.outputs.logicalFallacyCheck))
  .output("falsificationQuestion", f.string(challenger.outputs.falsificationQuestion))
  .output("edgeCaseScenario", f.string(challenger.outputs.edgeCaseScenario))
  .output("refinedPerspective", f.string(challenger.outputs.refinedPerspective))
  .build();
