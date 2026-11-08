// src/features/executive-eq/lib/validate.test.ts
import { LEARNING_FOCUSES } from "../options";
import { optionalText, requireOption, requireText } from "./validate";

describe("requireText", () => {
  it("trims and rejects blank or over-long input", () => {
    expect(requireText("  CTO  ", "Your role", 300)).toBe("CTO");
    expect(() => requireText("   ", "Your role", 300)).toThrow("Your role is required.");
    expect(() => requireText("x".repeat(301), "Your role", 300)).toThrow("Your role must be 300 characters or fewer.");
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("  ", "Industry context", 200)).toBeUndefined();
  });
});

describe("requireOption", () => {
  it("accepts only the listed learning focuses", () => {
    expect(requireOption("implied_authority", LEARNING_FOCUSES, "Learning focus")).toBe("implied_authority");
    expect(() => requireOption("Implied Authority", LEARNING_FOCUSES, "Learning focus")).toThrow();
  });
});
