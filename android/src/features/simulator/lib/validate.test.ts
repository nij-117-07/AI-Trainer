// src/features/simulator/lib/validate.test.ts
import { optionalText, requireText } from "./validate";

describe("requireText", () => {
  it("trims and returns the text", () => {
    expect(requireText("  Hello  ", "Persona", 10)).toBe("Hello");
  });

  it("rejects blank and over-long text", () => {
    expect(() => requireText("  ", "Persona", 10)).toThrow("Persona is required.");
    expect(() => requireText("abcdefghijk", "Persona", 10)).toThrow("Persona must be 10 characters or fewer.");
  });
});

describe("optionalText", () => {
  it("returns undefined when empty", () => {
    expect(optionalText("   ", "Context", 10)).toBeUndefined();
  });

  it("returns trimmed text when present", () => {
    expect(optionalText(" Crew tired ", "Context", 20)).toBe("Crew tired");
  });
});
