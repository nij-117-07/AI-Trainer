import { optionalText, requireText } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  French  ", "Language", 100)).toBe("French");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Language", 100)).toThrow("Language is required.");
    expect(() => requireText("x".repeat(101), "Language", 100)).toThrow(
      "Language must be 100 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("  ", "Additional instructions", 1000)).toBeUndefined();
  });

  it("rejects text longer than the limit", () => {
    expect(() => optionalText("x".repeat(1001), "Additional instructions", 1000)).toThrow();
  });
});
