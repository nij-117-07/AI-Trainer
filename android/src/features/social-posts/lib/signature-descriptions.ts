// src/features/social-posts/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signature. The text is copied from the DSPy
 * PostGenerator signature in Backend/tools/social_posts/services.py, so both stacks give the
 * model the same guidance. Keys use the Ax field names; the matching DSPy field is noted beside
 * each key.
 */

export const POST_GENERATOR_DESCRIPTIONS = {
  instruction:
    "You are a professional Content Strategist. Generate high-quality social media post suggestions based on the platform, user query, and historical context. Maintain the tone specified in the system prompt.",
  inputs: {
    // system_prompt
    systemPrompt: "The persona and brand voice rules.",
    // platform
    platform: "Target platform (e.g., LinkedIn, X, Instagram, Thread).",
    // user_query
    userQuery: "The core topic or goal for the post.",
    // chat_history
    chatHistory: "Past interactions to maintain context.",
    // liked_post_examples
    likedPostExamples: "Examples of posts the user liked for style matching.",
    // num_suggestions
    numSuggestions: "Number of post variants to generate.",
  },
  outputs: {
    // user_message
    userMessage:
      "A friendly, conversational message explaining the strategy behind these posts.",
    // post_suggestions
    postSuggestions:
      "A list of generated posts. Each dictionary must contain: - 'variant_id': A number or label (e.g., '1') - 'content': The actual post body content - 'designer_notes': A brief explanation of why this post works for the platform",
  },
};
