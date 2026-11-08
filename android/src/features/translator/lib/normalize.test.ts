// src/features/translator/lib/normalize.test.ts
import { normalizeTranslation, textOf } from "./normalize";

describe("normalizeTranslation", () => {
  it("trims every field", () => {
    expect(
      normalizeTranslation({ rationale: " kept idiom ", translatedText: " 早起き ", culturalNotes: " note " }),
    ).toEqual({ rationale: "kept idiom", translatedText: "早起き", culturalNotes: "note" });
  });

  it("falls back to empty text when the model omits fields", () => {
    expect(normalizeTranslation({ translatedText: "hola" })).toEqual({
      rationale: "",
      translatedText: "hola",
      culturalNotes: "",
    });
  });

  it("replaces wrongly typed fields with empty text", () => {
    expect(normalizeTranslation({ rationale: 42, translatedText: ["x"], culturalNotes: null })).toEqual({
      rationale: "",
      translatedText: "",
      culturalNotes: "",
    });
  });
});

describe("textOf", () => {
  it("returns empty text for non-strings", () => {
    expect(textOf(undefined)).toBe("");
    expect(textOf({ a: 1 })).toBe("");
  });
});
