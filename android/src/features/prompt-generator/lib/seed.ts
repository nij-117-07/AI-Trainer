// src/features/prompt-generator/lib/seed.ts
/** Random seed for persona generation, matching the backend's 8-character letters and digits. */

const SEED_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function randomSeed(length = 8): string {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += SEED_CHARS[Math.floor(Math.random() * SEED_CHARS.length)];
  }
  return out;
}
