// src/features/idioms/lib/normalize.test.ts
import { normalizeIdiomLesson } from "./normalize";

describe("normalizeIdiomLesson", () => {
  it("trims text fields", () => {
    const lesson = normalizeIdiomLesson({
      idiomInTargetLanguage: "  Avoir le cafard  ",
      figurativeMeaning: " To feel down ",
    });
    expect(lesson.idiomInTargetLanguage).toBe("Avoir le cafard");
    expect(lesson.figurativeMeaning).toBe("To feel down");
  });

  it("turns missing or non-text fields into empty strings", () => {
    const lesson = normalizeIdiomLesson({ practicePrompt: 42 as unknown, dialogueScenario: ["x"] as unknown });
    expect(lesson.practicePrompt).toBe("");
    expect(lesson.dialogueScenario).toBe("");
    expect(lesson.rationale).toBe("");
  });
});
