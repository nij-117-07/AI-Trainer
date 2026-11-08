// src/features/poet-engine/lib/validate.test.ts
import {
  optionalText,
  requireOption,
  requireText,
  throwIfAborted,
} from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  Ishq  ", "Concept word", 200)).toBe("Ishq");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Concept word", 200)).toThrow(
      "Concept word is required.",
    );
    expect(() => requireText("x".repeat(201), "Concept word", 200)).toThrow(
      "Concept word must be 200 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("  ", "Custom instruction", 1000)).toBeUndefined();
  });

  it("rejects text longer than the limit", () => {
    expect(() =>
      optionalText("x".repeat(1001), "Custom instruction", 1000),
    ).toThrow();
  });
});

describe("requireOption", () => {
  it("returns a listed style and rejects anything else", () => {
    expect(
      requireOption("Haiku", ["Haiku", "Ghazal-style"], "Poetic style"),
    ).toBe("Haiku");
    expect(() =>
      requireOption("Sonnet", ["Haiku", "Ghazal-style"], "Poetic style"),
    ).toThrow("Poetic style must be one of: Haiku, Ghazal-style.");
  });
});

describe("throwIfAborted", () => {
  it("throws only when the signal is aborted", () => {
    const controller = new AbortController();
    expect(() => throwIfAborted(controller.signal)).not.toThrow();
    controller.abort();
    expect(() => throwIfAborted(controller.signal)).toThrow(
      "Generation was cancelled.",
    );
  });
});
