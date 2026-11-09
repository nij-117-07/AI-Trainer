import { toSubtopicResult } from "./normalise";
import { clampCount, requireText } from "./validate";

describe("subtopic-lister validate", () => {
  it("requires a topic", () => {
    expect(() => requireText("  ", "Topic", 200)).toThrow("Topic is required.");
  });

  it("clamps the count to the allowed range", () => {
    expect(clampCount(1)).toBe(3);
    expect(clampCount(50)).toBe(20);
    expect(clampCount(7.6)).toBe(8);
    expect(clampCount(undefined)).toBe(8);
  });
});

describe("subtopic-lister normalise", () => {
  it("keeps valid subtopics and drops empty ones", () => {
    const result = toSubtopicResult("Algebra", {
      subtopics: [
        { name: "Variables", description: "Letters that stand for numbers." },
        { name: "", description: "ignored" },
        null,
      ],
    });
    expect(result).toEqual({
      topic: "Algebra",
      subtopics: [{ name: "Variables", description: "Letters that stand for numbers." }],
    });
  });

  it("returns an empty list for bad input", () => {
    expect(toSubtopicResult("Algebra", null).subtopics).toEqual([]);
  });
});
