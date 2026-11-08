// src/features/prompt-generator/lib/signature-descriptions.ts
/**
 * Instruction and field descriptions for the Prompt Generator Ax signature. The instruction and the
 * seed, persona name, and system prompt text are copied from GeneralPersonaGenerator in
 * Backend/tools/prompt_generator/services.py. The DSPy signature has no description for the
 * remaining inputs, so those use the matching field description in schemas.py PersonaCreate.
 * Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const PROMPT_GENERATOR_DESCRIPTIONS = {
  instruction:
    "You are an expert Prompt Engineer. Craft a highly effective System Persona. Define: Identity, Tone, Knowledge Boundaries, and Behavioral Rules.",
  inputs: {
    // seed
    seed: "Random string to ensure variety.",
    // reference_samples
    referenceSamples: "Examples of existing prompts or writing styles to emulate.",
    // scenario
    scenario: "The specific use-case or domain (e.g., 'Financial Advisor').",
    // past_prompt
    pastPrompt: "A previous version of the persona to iterate upon or improve.",
    // context
    context: "Background information, target audience, or environment constraints.",
    // user_instructions
    userInstructions: "Specific 'dos and don'ts', stylistic preferences, or personality traits.",
  },
  outputs: {
    // persona_name
    personaName: "Professional name for the persona.",
    // generated_persona_system_prompt
    generatedPersonaSystemPrompt: "The complete System Prompt.",
  },
};
