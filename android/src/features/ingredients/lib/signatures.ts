// src/features/ingredients/lib/signatures.ts
/**
 * Ax signature for the Ingredients Checker. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/tools/ingredients/services.py.
 */
import { f } from "@ax-llm/ax";
import { INGREDIENTS_CHECKER_DESCRIPTIONS } from "./signature-descriptions";

const checker = INGREDIENTS_CHECKER_DESCRIPTIONS;

export const ingredientsCheckerSignature = f()
  .description(checker.instruction)
  .input("ingredientsImage", f.image(checker.inputs.ingredientsImage))
  .input("manualTextInput", f.string(checker.inputs.manualTextInput).optional())
  .output("extractedIngredients", f.string(checker.outputs.extractedIngredients).array())
  .output("healthLevel", f.number(checker.outputs.healthLevel).min(1).max(5))
  .output("riskFactors", f.string(checker.outputs.riskFactors).array())
  .output("summaryAnalysis", f.string(checker.outputs.summaryAnalysis))
  .build();
