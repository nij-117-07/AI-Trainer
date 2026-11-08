// src/features/rewriter/lib/validate.test.ts
import {
  optionalText,
  requireOption,
  requireText,
  throwIfAborted,
} from "./validate";

describe("requireText", () => {
  it("trims and returns the value", () => {
    expect(requireText("  witty  ", "Target tone", 200)).toBe("witty");
  });

  it("rejects blank and over-long input", () => {
    expect(() => requireText("   ", "Target tone", 200)).toThrow(
      "Target tone is required.",
    );
    expect(() => requireText("x".repeat(201), "Target tone", 200)).toThrow(
      "Target tone must be 200 characters or fewer.",
    );
  });
});

describe("optionalText", () => {
  it("returns undefined for blank input", () => {
    expect(optionalText("  ", "Custom instructions", 1000)).toBeUndefined();
  });

  it("rejects text longer than the limit", () => {
    expect(() =>
      optionalText("x".repeat(1001), "Custom instructions", 1000),
    ).toThrow("Custom instructions must be 1000 characters or fewer.");
  });
});

describe("requireOption", () => {
  it("returns a listed goal and rejects anything else", () => {
    expect(
      requireOption(
        "shorten",
        ["paraphrase", "shorten"],
        "Transformation goal",
      ),
    ).toBe("shorten");
    expect(() =>
      requireOption(
        "expand-more",
        ["paraphrase", "shorten"],
        "Transformation goal",
      ),
    ).toThrow("Transformation goal must be one of: paraphrase, shorten.");
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
