// src/features/language-tester/lib/test-modes.ts
/**
 * Picks the translation challenge direction from the seed, so the same seed always gives the same
 * direction. The backend uses Python's random.Random for this; the values differ, but the rule holds.
 */
import { TEST_TYPES, type TestType } from "../types";

export function testTypeForSeed(seed: string): TestType {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return TEST_TYPES[(hash >>> 0) % TEST_TYPES.length];
}
