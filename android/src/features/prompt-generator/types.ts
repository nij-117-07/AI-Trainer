// src/features/prompt-generator/types.ts
/** Form values and result shape for the Prompt Generator (persona) tool. */

export interface PromptGeneratorFormValues {
  scenario: string;
  context: string;
  userInstructions: string;
  referenceSamples: string;
  pastPrompt: string;
  seed: string;
}

export interface PersonaResult {
  personaName: string;
  systemPrompt: string;
  seedUsed: string;
}
