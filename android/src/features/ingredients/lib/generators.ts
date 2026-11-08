// src/features/ingredients/lib/generators.ts
/**
 * Ingredients Checker generator. Validates the photo and optional text, sends the image to the
 * model through Ax, and normalises the result. It follows Backend/tools/ingredients/services.py.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { IngredientAnalysis, IngredientsCheckInput } from "../types";
import { ingredientsCheckerSignature } from "./signatures";
import { normalizeIngredientAnalysis } from "./normalize";
import { MANUAL_TEXT_MAX_LENGTH, optionalText, requireImage } from "./validate";

const TEMPERATURE = 0.1;

export async function checkIngredients(
  settings: AiSettings,
  values: IngredientsCheckInput,
  signal?: AbortSignal,
): Promise<IngredientAnalysis> {
  const image = requireImage(values.image);
  const manualText = optionalText(values.manualText, "Manual text", MANUAL_TEXT_MAX_LENGTH);
  if (signal?.aborted) throw new Error("Analysis cancelled.");
  const llm = createLlm(settings);
  const result = await ax(ingredientsCheckerSignature).forward(
    llm,
    {
      ingredientsImage: { mimeType: image.mimeType, data: image.base64 },
      manualTextInput: manualText,
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  if (signal?.aborted) throw new Error("Analysis cancelled.");
  return normalizeIngredientAnalysis(result);
}
