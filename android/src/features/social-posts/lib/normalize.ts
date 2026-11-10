// src/features/social-posts/lib/normalize.ts
/**
 * Turns raw model output and stored JSON into the typed values the screens render. Every list is
 * checked, every post is read field by field, and posts without content are dropped.
 */
import type { SocialPost, SocialPostResult, SocialPostRevision } from "../types";

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

export function newPostId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeSocialPosts(
  raw: { userMessage?: unknown; postSuggestions?: unknown },
  context: { platform: string; userQuery: string },
): SocialPostResult {
  const posts: SocialPost[] = listOf(raw.postSuggestions)
    .filter(isRecord)
    .map((item, index) => ({
      id: newPostId(),
      parentId: null,
      label: `Variant ${textOf(item.variantId) || String(index + 1)}`,
      content: textOf(item.content),
      designerNotes: textOf(item.designerNotes),
    }))
    .filter((post) => post.content);
  return {
    platform: context.platform,
    userQuery: context.userQuery,
    userMessage: textOf(raw.userMessage),
    posts,
  };
}

export function normalizeRevision(raw: { content?: unknown; designerNotes?: unknown }): SocialPostRevision {
  const content = textOf(raw.content);
  if (!content) throw new Error("The model returned an empty post. Please try again.");
  return { content, designerNotes: textOf(raw.designerNotes) };
}

/** Stored JSON is not trusted. Keeps only valid posts and returns null when the result is damaged. */
export function restoreSocialPostResult(saved: unknown): SocialPostResult | null {
  if (!isRecord(saved)) return null;
  const posts: SocialPost[] = listOf(saved.posts)
    .filter(isRecord)
    .map((item) => ({
      id: textOf(item.id),
      parentId: textOf(item.parentId) || null,
      label: textOf(item.label),
      content: textOf(item.content),
      designerNotes: textOf(item.designerNotes),
    }))
    .filter((post) => post.id && post.label && post.content);
  return {
    platform: textOf(saved.platform),
    userQuery: textOf(saved.userQuery),
    userMessage: textOf(saved.userMessage),
    posts,
  };
}
