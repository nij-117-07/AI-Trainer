import { optionalText, requireText } from "./validate";

describe("requireText", () => {
  it("trims and rejects blank or over-long text", () => {
    expect(requireText("  Cyberpunk ", "Field of interest", 200)).toBe("Cyberpunk");
    expect(() => requireText(" ", "Field of interest", 200)).toThrow("Field of interest is required.");
    expect(() => requireText("x".repeat(201), "Field of interest", 200)).toThrow(
      "Field of interest must be 200 characters or fewer.",
    );
  });

  it("accepts a custom choice that is not in any preset list", () => {
    expect(requireText("Musical", "Cognitive domain", 100)).toBe("Musical");
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("   ", "User instructions", 1000)).toBeUndefined();
  });

  it("trims and returns the value", () => {
    expect(optionalText("  Keep it short  ", "User instructions", 1000)).toBe("Keep it short");
  });

  it("rejects over-long input", () => {
    expect(() => optionalText("x".repeat(1001), "User instructions", 1000)).toThrow(
      "User instructions must be 1000 characters or fewer.",
    );
  });
});
