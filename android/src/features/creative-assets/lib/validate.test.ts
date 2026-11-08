// src/features/creative-assets/lib/validate.test.ts
import { clampCount, optionalLines, optionalText, requireOption, requireText, throwIfAborted } from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  Bamboo toothbrush  ", "Topic", 2000)).toBe("Bamboo toothbrush");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Topic", 2000)).toThrow("Topic is required.");
    expect(() => requireText("x".repeat(2001), "Topic", 2000)).toThrow(
      "Topic must be 2000 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("", "Context", 2000)).toBeUndefined();
  });
});

describe("optionalLines", () => {
  it("keeps trimmed, non-empty lines joined by newlines", () => {
    expect(optionalLines(" #Eco \n\n #Green ", "Examples", 3000)).toBe("#Eco\n#Green");
  });

  it("returns undefined when there are no lines", () => {
    expect(optionalLines("\n  \n", "Examples", 3000)).toBeUndefined();
  });

  it("checks the raw length against the limit", () => {
    expect(() => optionalLines("x".repeat(3001), "Examples", 3000)).toThrow(
      "Examples must be 3000 characters or fewer.",
    );
  });
});

describe("requireOption", () => {
  it("returns a listed task type and rejects anything else", () => {
    expect(requireOption("Hashtags", ["Hashtags", "Slogans"], "Task type")).toBe("Hashtags");
    expect(() => requireOption("Poems", ["Hashtags", "Slogans"], "Task type")).toThrow(
      "Task type must be one of: Hashtags, Slogans.",
    );
  });
});

describe("clampCount", () => {
  it("rounds and keeps the value inside the range", () => {
    expect(clampCount(7.4, 1, 20)).toBe(7);
    expect(clampCount(0, 1, 20)).toBe(1);
    expect(clampCount(50, 1, 20)).toBe(20);
  });
});

describe("throwIfAborted", () => {
  it("throws only when the signal is aborted", () => {
    const controller = new AbortController();
    expect(() => throwIfAborted(controller.signal)).not.toThrow();
    controller.abort();
    expect(() => throwIfAborted(controller.signal)).toThrow("Generation was cancelled.");
  });
});
