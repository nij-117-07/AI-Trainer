// src/features/memory-helper/lib/generators.ts
/**
 * Memory Helper generator. It validates the input, builds an Ax generator from the saved AI
 * settings, and returns hooks read field by field so a missing field cannot crash the screen.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { listOf, optionalText, requireText, textOf } from "./normalise";
import { memoryAgentSignature } from "./signatures";
import { CONTENT_MAX, CONTENT_MIN, type MemoryFormValues, type MemoryHook, type MemoryResult } from "./types";

const TEMPERATURE = 0.5;
const DEFAULT_TECHNIQUE = "Best Fit";

export async function generateMemoryAids(settings: AiSettings, values: MemoryFormValues): Promise<MemoryResult> {
  const llm = createLlm(settings);
  const result = await ax(memoryAgentSignature).forward(
    llm,
    {
      contentToRemember: requireText(values.topic, "Facts to memorize", CONTENT_MAX, CONTENT_MIN),
      preferredTechnique: optionalText(values.technique, 100) ?? DEFAULT_TECHNIQUE,
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  const memoryHooks: MemoryHook[] = listOf<{ concept?: unknown; hook?: unknown } | null>(result.memoryHooks).map(
    (item) => ({ concept: textOf(item?.concept), hook: textOf(item?.hook) }),
  );
  return {
    explanation: textOf(result.explanation),
    memoryHooks,
    retentionPlan: textOf(result.retentionPlan),
  };
}
