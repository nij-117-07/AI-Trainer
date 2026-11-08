// src/features/social-posts/types.ts

export interface SocialPostFormValues {
  systemPrompt: string;
  platform: string;
  userQuery: string;
  chatHistory: string;
  likedPostExamples: string;
  numSuggestions: number;
}

export interface SocialPost {
  variantId: string;
  content: string;
  designerNotes: string;
}

export interface SocialPostResult {
  userMessage: string;
  postSuggestions: SocialPost[];
}
