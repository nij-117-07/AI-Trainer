// src/features/bias-inoculator/lib/signatures.ts
/**
 * Ax signature for the Cognitive Bias Inoculator. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/bias_inoculator/services.py.
 * The bias enum is sent as a string with the allowed values listed in the description.
 */
import { f } from "@ax-llm/ax";
import { BIAS_INOCULATOR_DESCRIPTIONS } from "./signature-descriptions";

const bias = BIAS_INOCULATOR_DESCRIPTIONS;

export const cognitiveBiasSignature = f()
  .description(bias.instruction)
  .input("conversationHistory", f.string(bias.inputs.conversationHistory))
  .input("targetBias", f.string(bias.inputs.targetBias))
  .input("userInterest", f.string(bias.inputs.userInterest))
  .output("scenarioSetup", f.string(bias.outputs.scenarioSetup))
  .output("intuitiveTrap", f.string(bias.outputs.intuitiveTrap))
  .output("rationalAnalysis", f.string(bias.outputs.rationalAnalysis))
  .output("realWorldApplication", f.string(bias.outputs.realWorldApplication))
  .build();
