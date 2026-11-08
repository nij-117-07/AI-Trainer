// src/features/motivation/lib/signatures.ts
/**
 * Ax signatures for the Motivation & Reflection tools. Instructions and field descriptions live
 * in signature-descriptions.ts, which is copied from Backend/learning/motivation/services.py.
 */
import { f } from "@ax-llm/ax";
import { MOTIVATIONAL_QUOTE_DESCRIPTIONS, REFLECTION_PROMPT_DESCRIPTIONS } from "./signature-descriptions";

const quote = MOTIVATIONAL_QUOTE_DESCRIPTIONS;
const reflection = REFLECTION_PROMPT_DESCRIPTIONS;

export const motivationalQuoteSignature = f()
  .description(quote.instruction)
  .input("randomSeed", f.string(quote.inputs.randomSeed))
  .input("seedTopic", f.string(quote.inputs.seedTopic))
  .input("currentDate", f.string(quote.inputs.currentDate))
  .input("quoteType", f.string(quote.inputs.quoteType))
  .input("userFeeling", f.string(quote.inputs.userFeeling))
  .output("quote", f.string(quote.outputs.quote))
  .output("authorPersona", f.string(quote.outputs.authorPersona))
  .output("actionableInsight", f.string(quote.outputs.actionableInsight))
  .build();

export const reflectionPromptSignature = f()
  .description(reflection.instruction)
  .input("randomSeed", f.string(reflection.inputs.randomSeed))
  .input("currentMood", f.string(reflection.inputs.currentMood))
  .input("goalAlignment", f.string(reflection.inputs.goalAlignment))
  .input("recentPatterns", f.string(reflection.inputs.recentPatterns).optional())
  .output("prompts", f.string(reflection.outputs.prompts).array())
  .output("perspectiveShift", f.string(reflection.outputs.perspectiveShift))
  .build();
