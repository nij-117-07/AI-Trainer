// src/features/creative-assets/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signature. The text is copied from the DSPy
 * CreativeAssetGenerator signature in Backend/tools/creative_assets/services.py, so both stacks
 * give the model the same guidance. Keys use the Ax field names; the matching DSPy field is noted
 * beside each key.
 */

export const CREATIVE_MORE_DESCRIPTIONS = {
  instruction:
    "You are a Creative Marketing Expert. The user liked the suggestions listed in liked_suggestions. Generate new suggestions of the same kind and in the same spirit. Do not copy the liked suggestions. Follow the user's extra instructions when they are given.",
  inputs: {
    likedSuggestions: "Suggestions the user liked. Generate new items in the same spirit, not copies of these, one per line.",
    userInstructions: "Optional extra instructions from the user for this round.",
  },
};

export const CREATIVE_ASSET_DESCRIPTIONS = {
  instruction:
    "You are a Creative Marketing Expert. Your task is to generate high-impact product names, titles, hashtags, or marketing lines based on user input. You must align your suggestions with the provided context and the user's existing preferred style.",
  inputs: {
    // task_type
    taskType:
      "The type of asset to generate (e.g., 'Product Names', 'Hashtags', 'SEO Titles', 'Slogans').",
    // user_query
    userQuery: "The primary topic, product description, or raw idea.",
    // context
    context: "Target audience, tone, or specific marketing goals.",
    // reference_examples
    referenceExamples:
      "A list of existing titles or hashtags that the user likes for style reference.",
    // number_of_suggestions
    numberOfSuggestions: "The number of unique variations to generate.",
  },
  outputs: {
    // suggestions
    suggestions:
      "A list of generated creative assets. Each dictionary contains: - 'suggestion': The generated name, title, or tag. - 'explanation': Why this aligns with the user's preference and why it's effective for the target audience.",
  },
};
