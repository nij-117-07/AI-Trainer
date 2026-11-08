// src/features/sentence-of-the-day/lib/normalize.test.ts
import { normalizeSentence } from "./normalize";
import { formatLocalDate } from "./text";

describe("normalizeSentence", () => {
  it("keeps the model text and stamps the date", () => {
    const sentence = normalizeSentence(
      {
        targetSentence: " Más vale tarde que nunca. ",
        literalTranslation: "More worth late than never.",
        naturalTranslation: "Better late than never.",
        grammaticalHighlight: "Comparative with más vale.",
        culturalContext: "Common proverb.",
        substitutionOptions: ["Más vale pronto que tarde.", " "],
      },
      "2026-11-08",
    );
    expect(sentence.date).toBe("2026-11-08");
    expect(sentence.targetSentence).toBe("Más vale tarde que nunca.");
    expect(sentence.substitutionOptions).toEqual(["Más vale pronto que tarde."]);
  });

  it("falls back to empty values when fields are missing", () => {
    const sentence = normalizeSentence({ substitutionOptions: "one line" }, "2026-11-08");
    expect(sentence.targetSentence).toBe("");
    expect(sentence.substitutionOptions).toEqual([]);
  });
});

describe("formatLocalDate", () => {
  it("formats as zero-padded YYYY-MM-DD", () => {
    expect(formatLocalDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
