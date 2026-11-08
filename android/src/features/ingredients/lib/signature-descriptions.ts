// src/features/ingredients/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signature. The text is copied from the DSPy
 * IngredientsChecker signature in Backend/tools/ingredients/services.py, so both stacks give the
 * model the same guidance. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const INGREDIENTS_CHECKER_DESCRIPTIONS = {
  instruction:
    "You are an expert nutritionist and food safety analyst. Analyze the provided ingredients (via image or text) and categorize the product on a Health Level scale from 1 to 5.\n\nLevel Scale:\n1: Ultra-processed / Harmful additives (Avoid)\n2: High Sugar/Sodium or Artificial Preservatives\n3: Moderately processed but generally safe\n4: Whole foods with minimal processing\n5: Organic / Pure / Highly Nutritious (Excellent)",
  inputs: {
    // ingredients_image
    ingredientsImage: "Photo of the ingredients list on the packaging.",
    // manual_text_input
    manualTextInput: "Optional manual text of ingredients if the image is blurry.",
  },
  outputs: {
    // extracted_ingredients
    extractedIngredients: "List of detected ingredients.",
    // health_level
    healthLevel: "The assigned health level (1-5).",
    // risk_factors
    riskFactors: "List of concerning additives, allergens, or high-sugar items.",
    // summary_analysis
    summaryAnalysis: "A brief explanation of why this level was assigned.",
  },
};
