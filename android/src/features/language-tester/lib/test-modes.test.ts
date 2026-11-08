// src/features/language-tester/lib/test-modes.test.ts
import { TEST_TYPES } from "../types";
import { testTypeForSeed } from "./test-modes";

describe("testTypeForSeed", () => {
  it("is stable for the same seed", () => {
    expect(testTypeForSeed("arch_v105")).toBe(testTypeForSeed("arch_v105"));
  });

  it("always returns a known test type", () => {
    for (const seed of ["", "a", "challenge_1700000000", "x".repeat(200)]) {
      expect(TEST_TYPES).toContain(testTypeForSeed(seed));
    }
  });

  it("varies across seeds", () => {
    const seen = new Set(Array.from({ length: 30 }, (_, index) => testTypeForSeed(`seed-${index}`)));
    expect(seen.size).toBeGreaterThan(1);
  });
});
