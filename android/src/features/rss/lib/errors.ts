// src/features/rss/lib/errors.ts
/** Reads a readable message from an unknown thrown value. */
export function messageOf(error: unknown, fallback = "Something went wrong. Please try again."): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
