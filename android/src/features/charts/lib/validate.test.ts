// src/features/charts/lib/validate.test.ts
import { optionalText, requireText } from "./validate";

describe("requireText", () => {
  it("trims the value and returns it", () => {
    expect(requireText("  [1, 2, 3]  ", "Data input", 100)).toBe("[1, 2, 3]");
  });

  it("rejects empty input", () => {
    expect(() => requireText("   ", "Data input", 100)).toThrow("Data input is required.");
  });

  it("rejects input longer than the limit", () => {
    expect(() => requireText("abcd", "Instructions", 3)).toThrow("Instructions must be 3 characters or fewer.");
  });
});

describe("optionalText", () => {
  it("returns undefined when the value is blank", () => {
    expect(optionalText("  \n ", "Previous code", 100)).toBeUndefined();
  });

  it("returns trimmed text when present", () => {
    expect(optionalText(" new Chart() ", "Previous code", 100)).toBe("new Chart()");
  });

  it("rejects text longer than the limit", () => {
    expect(() => optionalText("abcd", "Previous code", 3)).toThrow("Previous code must be 3 characters or fewer.");
  });
});
