// src/features/diagram/lib/validate.test.ts
import { optionalText, requireFormat, requireText } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  Login flow  ", "Instruction", 2000)).toBe("Login flow");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Instruction", 2000)).toThrow("Instruction is required.");
    expect(() => requireText("x".repeat(2001), "Instruction", 2000)).toThrow(
      "Instruction must be 2000 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("  ", "Context", 2000)).toBeUndefined();
  });

  it("rejects text longer than the limit", () => {
    expect(() => optionalText("x".repeat(2001), "Context", 2000)).toThrow();
  });
});

describe("requireFormat", () => {
  it("accepts the two supported formats", () => {
    expect(requireFormat("mermaid")).toBe("mermaid");
    expect(requireFormat("drawio")).toBe("drawio");
  });

  it("rejects any other format", () => {
    expect(() => requireFormat("svg")).toThrow("Format must be Mermaid or Draw.io.");
  });
});
