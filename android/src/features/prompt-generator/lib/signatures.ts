// src/features/prompt-generator/lib/signatures.ts
/**
 * Ax signature for the persona generator. Instructions and field descriptions live in
 * signature-descriptions.ts. List inputs are sent newline-joined, so they are plain strings here.
 */
import { f } from "@ax-llm/ax";
import { PROMPT_GENERATOR_DESCRIPTIONS } from "./signature-descriptions";

const desc = PROMPT_GENERATOR_DESCRIPTIONS;

export const personaSignature = f()
  .description(desc.instruction)
  .input("seed", f.string(desc.inputs.seed))
  .input("referenceSamples", f.string(`${desc.inputs.referenceSamples} One example per line.`).optional())
  .input("scenario", f.string(desc.inputs.scenario))
  .input("pastPrompt", f.string(desc.inputs.pastPrompt).optional())
  .input("context", f.string(desc.inputs.context).optional())
  .input("userInstructions", f.string(desc.inputs.userInstructions).optional())
  .output("personaName", f.string(desc.outputs.personaName))
  .output("generatedPersonaSystemPrompt", f.string(desc.outputs.generatedPersonaSystemPrompt))
  .build();
