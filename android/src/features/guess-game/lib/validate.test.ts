import { optionalText, requireOption, requireText, resolveCategory } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  Eiffel Tower  ", "Guess", 200)).toBe("Eiffel Tower");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Guess", 200)).toThrow("Guess is required.");
    expect(() => requireText("x".repeat(201), "Guess", 200)).toThrow("Guess must be 200 characters or fewer.");
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("  ", "Vocabulary theme", 200)).toBeUndefined();
  });

  it("rejects text longer than the limit", () => {
    expect(() => optionalText("x".repeat(201), "Vocabulary theme", 200)).toThrow();
  });
});

describe("requireOption", () => {
  it("returns a listed option and rejects anything else", () => {
    expect(requireOption("movie", ["word", "movie"], "Category")).toBe("movie");
    expect(() => requireOption("poem", ["word", "movie"], "Category")).toThrow(
      "Category must be one of: word, movie.",
    );
  });
});

describe("resolveCategory", () => {
  it("returns a preset category as is", () => {
    expect(resolveCategory({ category: "movie", customCategory: "" })).toBe("movie");
  });

  it("returns the trimmed custom text when Other is picked", () => {
    expect(resolveCategory({ category: "other", customCategory: "  Board games " })).toBe("Board games");
  });

  it("requires custom text when Other is picked", () => {
    expect(() => resolveCategory({ category: "other", customCategory: "   " })).toThrow("Custom category is required.");
  });
});
