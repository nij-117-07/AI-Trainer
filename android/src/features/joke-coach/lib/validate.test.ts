// src/features/joke-coach/lib/validate.test.ts
import { requireOption, requireText, optionalText, throwIfAborted } from "./validate";

describe("requireText", () => {
  it("trims and returns the text", () => {
    expect(requireText("  programming  ", "Topic", 300)).toBe("programming");
  });

  it("rejects empty text", () => {
    expect(() => requireText("   ", "Topic", 300)).toThrow("Topic is required.");
  });

  it("rejects text over the limit", () => {
    expect(() => requireText("a".repeat(301), "Topic", 300)).toThrow("Topic must be 300 characters or fewer.");
  });
});

describe("optionalText", () => {
  it("drops empty input", () => {
    expect(optionalText("   ", "Context", 500)).toBeUndefined();
  });

  it("rejects input over the limit", () => {
    expect(() => optionalText("a".repeat(501), "Context", 500)).toThrow();
  });
});

describe("requireOption", () => {
  it("returns a listed option", () => {
    expect(requireOption("pun", ["pun", "dad-joke"], "Joke style")).toBe("pun");
  });

  it("rejects an unknown option", () => {
    expect(() => requireOption("haiku", ["pun", "dad-joke"], "Joke style")).toThrow(
      "Joke style must be one of: pun, dad-joke.",
    );
  });
});

describe("throwIfAborted", () => {
  it("throws once the signal is aborted", () => {
    const controller = new AbortController();
    expect(() => throwIfAborted(controller.signal)).not.toThrow();
    controller.abort();
    expect(() => throwIfAborted(controller.signal)).toThrow("Generation was cancelled.");
  });
});
