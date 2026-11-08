// src/features/social-posts/lib/persistence.ts
/** Storage key and saved-draft helper for the Social Media Post Generator. */

export interface SavedSocialPostsState<TForm, TResult> {
  form: TForm;
  result: TResult | null;
}

export const SOCIAL_POSTS_STORAGE_KEY = "tools.social-posts.generate.v1";

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
