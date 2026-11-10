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
      subtopics: [{ name: "Variables", description: "Letters that stand for numbers." }],
    });
  });

  it("returns an empty list for bad input", () => {
    expect(toSubtopicResult(null).subtopics).toEqual([]);
  });
});
