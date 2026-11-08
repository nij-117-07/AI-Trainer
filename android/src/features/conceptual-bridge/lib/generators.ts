// src/features/conceptual-bridge/lib/generators.ts
/**
 * Conceptual Bridge generator. Validates the two concepts, asks the model for one bridge with
 * the saved AI settings, and returns the result normalised.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { BridgeFormValues, BridgeResult } from "../types";
import { isAbstractionDepth, normalizeBridge } from "./normalize";
import { bridgeSignature } from "./signatures";

const TEMPERATURE = 0.8;
const CONCEPT_MAX = 200;
const SEED_MAX = 100000;

function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

function randomSeed(): number {
  return Math.floor(Math.random() * SEED_MAX) + 1;
}

export async function generateBridge(settings: AiSettings, values: BridgeFormValues): Promise<BridgeResult> {
  const llm = createLlm(settings);
  if (!isAbstractionDepth(values.abstractionDepth)) throw new Error("Choose an abstraction depth.");
  const result = await ax(bridgeSignature).forward(
    llm,
    {
      conceptA: requireText(values.conceptA, "First concept", CONCEPT_MAX),
      conceptB: requireText(values.conceptB, "Second concept", CONCEPT_MAX),
      abstractionDepth: values.abstractionDepth,
      seed: randomSeed(),
    },
    { modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeBridge(result);
}
