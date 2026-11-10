// src/features/conceptual-bridge/lib/signatures.ts
/**
 * Ax signature for the Conceptual Bridge. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/conceptual_bridge/services.py.
 */
import { f } from "@ax-llm/ax";
import { CONCEPTUAL_BRIDGE_DESCRIPTIONS } from "./signature-descriptions";

const bridge = CONCEPTUAL_BRIDGE_DESCRIPTIONS;

export const bridgeSignature = f()
  .description(bridge.instruction)
  .input("conceptA", f.string(bridge.inputs.conceptA))
  .input("conceptB", f.string(bridge.inputs.conceptB))
  .input(
    "customUserInput",
    f.string("Extra requests from the learner, such as a domain to lean on or a tone. 'None' if there are none."),
  )
  .input("seed", f.number(bridge.inputs.seed))
  .output("structuralAnalogy", f.string(bridge.outputs.structuralAnalogy))
  .output("bridgingNarrative", f.string(bridge.outputs.bridgingNarrative))
  .output("insightQuestion", f.string(bridge.outputs.insightQuestion))
  .output("cognitiveFlexibilityScore", f.number(bridge.outputs.cognitiveFlexibilityScore))
  .build();
