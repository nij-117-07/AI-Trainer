// src/features/social-posts/lib/persistence.ts
/** Storage keys, defaults, and saved-form merge for the Social Media Post Generator. */
import type { SocialPostFormValues } from "../types";

export const SOCIAL_POSTS_FORM_KEY = "tools.social-posts.form.v2";
export const SOCIAL_POSTS_RESULT_KEY = "tools.social-posts.result.v2";

export const SOCIAL_POSTS_DEFAULTS: SocialPostFormValues = {
  platform: "LinkedIn",
  userQuery: "",
  numSuggestions: 3,
};

/**
 * Takes each saved field only when its type matches the default, so an old or damaged draft
 * falls back to the default for that field.
 */
export function mergeSavedForm<T extends object>(defaults: T, saved: unknown): T {
  if (typeof saved !== "object" || saved === null || Array.isArray(saved)) return defaults;
  const record = saved as Record<string, unknown>;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T & string)[]) {
    const value = record[key];
    if (typeof value === typeof defaults[key]) merged[key] = value as T[typeof key];
  }
  return merged;
}
