// src/features/memory-helper/lib/signatures.ts
/**
 * Ax signature for the Memory Helper. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/learning/memory_helper/services.py.
 */
import { f } from "@ax-llm/ax";
import { MEMORY_AGENT_DESCRIPTIONS } from "./signature-descriptions";

const memory = MEMORY_AGENT_DESCRIPTIONS;

export const memoryAgentSignature = f()
  .description(memory.instruction)
  .input("contentToRemember", f.string(memory.inputs.contentToRemember))
  .input("preferredTechnique", f.string(memory.inputs.preferredTechnique).optional())
  .output("explanation", f.string(memory.outputs.explanation))
  .output(
    "memoryHooks",
    f
      .object(
        {
          concept: f.string(memory.memoryHook.concept),
          hook: f.string(memory.memoryHook.hook),
        },
        memory.outputs.memoryHooks,
      )
      .array(),
  )
  .output("retentionPlan", f.string(memory.outputs.retentionPlan))
  .build();
