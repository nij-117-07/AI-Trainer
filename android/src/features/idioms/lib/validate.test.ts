// src/features/idioms/lib/validate.test.ts
import { optionalText, requireOption, requireText } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  French  ", "Target language", 100)).toBe("French");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("  ", "Target language", 100)).toThrow("Target language is required.");
    expect(() => requireText("x".repeat(101), "Target language", 100)).toThrow(
      "Target language must be 100 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("   ", "Seed", 200)).toBeUndefined();
  });

  it("rejects text longer than the limit", () => {
    expect(() => optionalText("x".repeat(1001), "Custom request", 1000)).toThrow(
      "Custom request must be 1000 characters or fewer.",
    );
  });
});

describe("requireOption", () => {
  it("accepts a listed proficiency and rejects anything else", () => {
    expect(requireOption("native-aspirant", ["beginner", "native-aspirant"], "Proficiency")).toBe("native-aspirant");
    expect(() => requireOption("guru", ["beginner", "native-aspirant"], "Proficiency")).toThrow(
      "Proficiency must be one of: beginner, native-aspirant.",
    );
  });
});
