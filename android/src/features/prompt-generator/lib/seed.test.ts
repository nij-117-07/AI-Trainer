// src/features/prompt-generator/lib/seed.test.ts
import { randomSeed } from "./seed";

describe("randomSeed", () => {
  it("returns eight letters and digits by default", () => {
    expect(randomSeed()).toMatch(/^[A-Za-z0-9]{8}$/);
  });

  it("honours a custom length", () => {
    expect(randomSeed(12)).toMatch(/^[A-Za-z0-9]{12}$/);
  });

  it("varies between calls", () => {
    const seeds = new Set(Array.from({ length: 20 }, () => randomSeed()));
    expect(seeds.size).toBeGreaterThan(1);
  });
});
