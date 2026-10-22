// src/features/tools/ingredients/actions/check.ts
/**
 * Server Action for POST /tools/ingredients/check.
 * Uploads a photo of a product's ingredients list and returns a health analysis.
 */
"use server";

import {
  IngredientAnalysisResponseSchema,
  type IngredientAnalysisResponse,
} from "../types";
import { postFormData, safeParse, toolsApiUrl } from "../../lib/api";

export async function checkIngredientsAction(
  file: File,
  manualText: string
): Promise<IngredientAnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file, file.name);
  const trimmedManualText = manualText.trim();
  if (trimmedManualText) {
    formData.append("manual_text", trimmedManualText);
  }

  const raw = await postFormData<unknown>(
    toolsApiUrl("/tools/ingredients", "check"),
    formData
  );
  return safeParse(
    IngredientAnalysisResponseSchema,
    raw,
    "Invalid ingredients analysis response"
  );
}
