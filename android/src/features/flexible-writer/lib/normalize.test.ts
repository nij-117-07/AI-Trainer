// src/features/flexible-writer/lib/normalize.test.ts
import { normalizeFlexibleWriter, stringifyData, textOf } from "./normalize";

describe("textOf", () => {
  it("returns trimmed strings and empty text for anything else", () => {
    expect(textOf("  hi  ")).toBe("hi");
    expect(textOf(undefined)).toBe("");
    expect(textOf(42)).toBe("");
  });
});

describe("stringifyData", () => {
  it("keeps plain text and pretty-prints objects", () => {
    expect(stringifyData(" Rain stopped us. ")).toBe("Rain stopped us.");
    expect(stringifyData({ a: 1 })).toBe('{\n  "a": 1\n}');
  });

  it("handles empty and numeric values", () => {
    expect(stringifyData(null)).toBe("");
    expect(stringifyData(7)).toBe("7");
  });
});

describe("normalizeFlexibleWriter", () => {
  it("fills missing fields with empty text", () => {
    expect(normalizeFlexibleWriter({})).toEqual({ answerMessage: "", updatedData: "" });
  });

  it("maps the model fields", () => {
    expect(
      normalizeFlexibleWriter({
        answerMessage: "Rewrote it in 9 words.",
        updatedData: "Rain stopped us.",
      }),
    ).toEqual({ answerMessage: "Rewrote it in 9 words.", updatedData: "Rain stopped us." });
  });
});
