// src/features/social-posts/types.ts

export interface SocialPostFormValues {
  platform: string;
  userQuery: string;
  numSuggestions: number;
}

export interface SocialPost {
  id: string;
  parentId: string | null;
  label: string;
  content: string;
  designerNotes: string;
}

export interface SocialPostResult {
  platform: string;
  userQuery: string;
  userMessage: string;
  posts: SocialPost[];
}

export interface SocialPostRevision {
  content: string;
  designerNotes: string;
}
