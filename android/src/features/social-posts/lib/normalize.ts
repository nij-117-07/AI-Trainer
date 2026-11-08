// src/features/social-posts/lib/normalize.ts
/**
 * Turns raw model output into the typed result the screen renders. Every list is checked, every
 * post is read field by field, and posts without content are dropped.
 */
import type { SocialPost, SocialPostResult } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function textOf(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeSocialPosts(raw: { userMessage?: unknown; postSuggestions?: unknown }): SocialPostResult {
  const postSuggestions: SocialPost[] = listOf(raw.postSuggestions)
    .filter(isRecord)
    .map((item, index) => ({
      variantId: textOf(item.variantId) || String(index + 1),
      content: textOf(item.content),
      designerNotes: textOf(item.designerNotes),
    }))
    .filter((post) => post.content);
  return { userMessage: textOf(raw.userMessage), postSuggestions };
}
