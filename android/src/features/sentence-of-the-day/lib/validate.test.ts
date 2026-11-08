// src/features/sentence-of-the-day/lib/validate.test.ts
import { requireOption, requireText } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  Spanish ", "Target language", 100)).toBe("Spanish");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText(" ", "Native language", 100)).toThrow("Native language is required.");
    expect(() => requireText("x".repeat(101), "Native language", 100)).toThrow(
      "Native language must be 100 characters or fewer.",
    );
  });
});

describe("requireOption", () => {
  it("accepts only the backend enum values", () => {
    expect(requireOption("native-level", ["beginner", "native-level"], "Complexity level")).toBe("native-level");
    expect(() => requireOption("expert", ["beginner", "native-level"], "Complexity level")).toThrow(
      "Complexity level must be one of: beginner, native-level.",
    );
  });
});
