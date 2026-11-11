import { toSubtopicResult } from "./normalise";

describe("subtopic-lister normalise", () => {
  it("keeps valid subtopics and drops empty ones", () => {
    const result = toSubtopicResult({
      subtopics: [
        { name: "Variables", description: "Letters that stand for numbers." },
        { name: "", description: "ignored" },
        null,
      ],
    });
    expect(result).toEqual({
      subtopics: [{ name: "Variables", description: "Letters that stand for numbers.", kept: false }],
    });
  });

  it("returns an empty list for bad input", () => {
    expect(toSubtopicResult(null).subtopics).toEqual([]);
  });

  it("defaults kept to false and keeps a saved kept flag", () => {
    const result = toSubtopicResult({
      subtopics: [
        { name: "Loops", description: "" },
        { name: "Functions", description: "", kept: true },
      ],
    });
    expect(result.subtopics.map((item) => item.kept)).toEqual([false, true]);
  });
});
