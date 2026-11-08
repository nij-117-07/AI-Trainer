// src/features/prompt-generator/lib/validate.test.ts
import { optionalLines, optionalText, requireText } from "./validate";

describe("requireText", () => {
  it("trims and returns the scenario", () => {
    expect(requireText("  Financial Advisor  ", "Scenario", 200)).toBe("Financial Advisor");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Scenario", 200)).toThrow("Scenario is required.");
    expect(() => requireText("x".repeat(201), "Scenario", 200)).toThrow(
      "Scenario must be 200 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("", "Seed", 200)).toBeUndefined();
  });

  it("rejects text longer than the limit", () => {
    expect(() => optionalText("x".repeat(201), "Seed", 200)).toThrow();
  });
});

describe("optionalLines", () => {
  it("returns undefined when there are no lines", () => {
    expect(optionalLines("\n  \n", "Reference samples", 3000)).toBeUndefined();
  });

  it("keeps trimmed, non-empty lines joined by newlines", () => {
    expect(optionalLines(" Friendly tone \n\n Plain words ", "Reference samples", 3000)).toBe(
      "Friendly tone\nPlain words",
    );
  });

  it("checks the raw length against the limit", () => {
    expect(() => optionalLines("x".repeat(3001), "Reference samples", 3000)).toThrow(
      "Reference samples must be 3000 characters or fewer.",
    );
  });
});
