// src/features/resource-suggestor/lib/generators.ts
/**
 * Resource Suggestor generator. Validates the form, builds an Ax generator from the saved AI
 * settings, and returns a normalised result.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { ResourceSuggestorFormValues, ResourceSuggestorResult } from "../types";
import { resourceSuggestorSignature } from "./signatures";
import { toResourceResult } from "./normalise";
import { resourceTypeLabel } from "../options";
import { preferencesOrDefault, requireText, SUBJECT_MAX } from "./validate";

const TEMPERATURE = 0.7;

export async function suggestResources(
  settings: AiSettings,
  values: ResourceSuggestorFormValues,
): Promise<ResourceSuggestorResult> {
  const input = {
    backgroundSubject: requireText(values.backgroundSubject, "Background subject", SUBJECT_MAX),
    targetTopic: requireText(values.targetTopic, "Target topic", SUBJECT_MAX),
    resourceType: resourceTypeLabel(values.resourceType),
    additionalPreferences: preferencesOrDefault(values.additionalPreferences),
  };
  const llm = createLlm(settings);
  const result = await ax(resourceSuggestorSignature).forward(llm, input, {
    modelConfig: { temperature: TEMPERATURE },
  });
  return toResourceResult(result);
}
