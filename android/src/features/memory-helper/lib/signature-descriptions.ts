// src/features/memory-helper/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signature. The text is copied from the DSPy
 * signature in Backend/learning/memory_helper/services.py and the MemoryHook schema in
 * schemas.py, so both stacks give the model the same guidance. Keys use the Ax field names; the
 * matching DSPy field is noted beside each key.
 */

export const MEMORY_AGENT_DESCRIPTIONS = {
  instruction:
    "You are a Memory Specialist. Your goal is to transform complex information into memorable chunks using cognitive science techniques. You create structured study aids, mnemonics, or mental frameworks to help humans retain data long-term.",
  inputs: {
    // content_to_remember
    contentToRemember: "The facts, data, or topic the user wants to memorize.",
    // preferred_technique
    preferredTechnique:
      "Optional: Specific technique like 'Mnemonics', 'Feynman Technique', or 'Method of Loci'.",
  },
  outputs: {
    // explanation
    explanation: "A brief explanation of why this technique works for this data.",
    // memory_hooks
    memoryHooks:
      "A list of memory aids. Each item contains: 'concept': the specific piece of info, 'hook': the mnemonic, visualization, or shortcut to remember it.",
    // retention_plan
    retentionPlan: "A simple 3-step plan to review this information.",
  },
  memoryHook: {
    // MemoryHookRecord.concept in schemas.py
    concept: "The specific piece of info.",
    // MemoryHookRecord.hook in schemas.py
    hook: "The mnemonic or mental image.",
  },
};
