// src/features/lesson/lib/normalize.test.ts
import { normalizeLesson } from "./normalize";

describe("normalizeLesson", () => {
  it("maps a complete model output onto the lesson shape", () => {
    const lesson = normalizeLesson({
      lessonHeader: " Cooking in Japanese ",
      comparativeAnalysis: "Compared with English.",
      conceptDeepDive: "Deep dive.",
      thematicVocabulary: [{ word: "包丁", ipa: "hōchō", translation: "knife", example: "包丁を使う。" }],
      practiceSuite: ["1. Recognise", "2. Transform"],
      culturalNuance: "Insider tip.",
      homeworkMission: "Cook a meal.",
    });
    expect(lesson.header).toBe("Cooking in Japanese");
    expect(lesson.deepDive).toBe("Deep dive.");
    expect(lesson.vocabulary).toEqual([
      { word: "包丁", ipa: "hōchō", translation: "knife", example: "包丁を使う。" },
    ]);
    expect(lesson.practice).toHaveLength(2);
  });

  it("tolerates missing or malformed fields", () => {
    const lesson = normalizeLesson({
      lessonHeader: 42,
      thematicVocabulary: [null, "word", { word: "" }, { word: "hola" }],
      practiceSuite: "not a list",
    });
    expect(lesson).toEqual({
      header: "",
      comparativeAnalysis: "",
      deepDive: "",
      vocabulary: [{ word: "hola", ipa: "", translation: "", example: "" }],
      practice: [],
      nuance: "",
      homework: "",
    });
  });
});
