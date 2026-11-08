// src/features/roadmap/lib/normalize.test.ts
import { listOf, normalizeDraft, normalizeMainPoint, normalizeRoadmaps, textOf } from "./normalize";

describe("listOf and textOf", () => {
  it("returns an empty list for non-array values", () => {
    expect(listOf(undefined)).toEqual([]);
    expect(listOf("nope")).toEqual([]);
    expect(listOf({ length: 2 })).toEqual([]);
  });

  it("returns non-string values as empty text", () => {
    expect(textOf(42)).toBe("");
    expect(textOf(null)).toBe("");
    expect(textOf("ok")).toBe("ok");
  });
});

describe("normalizeRoadmaps", () => {
  it("drops broken entries and fills missing fields", () => {
    const roadmaps = normalizeRoadmaps([
      "junk",
      { id: "r1", subject: "Rust", mainPoints: [{ id: "p1", title: "Ownership", subtopics: [{ id: "s1", title: "Borrow" }] }, null] },
      { id: "", subject: "No id" },
      { id: "r2", subject: "   " },
    ]);

    expect(roadmaps).toHaveLength(1);
    expect(roadmaps[0]).toMatchObject({
      id: "r1",
      subject: "Rust",
      mode: "detailed",
      persona: "",
      mainPoints: [
        {
          id: "p1",
          title: "Ownership",
          done: false,
          milestone: "",
          subtopics: [{ id: "s1", title: "Borrow", done: false }],
        },
      ],
    });
  });

  it("returns an empty list when the stored value is not an array", () => {
    expect(normalizeRoadmaps({ roadmaps: [] })).toEqual([]);
    expect(normalizeRoadmaps(null)).toEqual([]);
  });
});

describe("normalizeMainPoint", () => {
  it("ignores subpoints that have no title", () => {
    const point = normalizeMainPoint({
      id: "p1",
      title: "Testing",
      done: true,
      subtopics: [{ id: "s1", title: "" }, { id: "s2", title: "Unit tests", done: true }],
    });
    expect(point?.done).toBe(true);
    expect(point?.subtopics).toEqual([{ id: "s2", title: "Unit tests", done: true }]);
  });
});

describe("normalizeDraft", () => {
  it("keeps form fields and drops blank topics", () => {
    const draft = normalizeDraft({
      form: { subject: "Go", mode: "short" },
      persona: "Mentor",
      topics: ["Basics", "", 3, "Concurrency"],
    });
    expect(draft?.form.subject).toBe("Go");
    expect(draft?.form.mode).toBe("short");
    expect(draft?.form.startLevel).toBe("");
    expect(draft?.topics).toEqual(["Basics", "Concurrency"]);
  });

  it("returns null for a non-object draft", () => {
    expect(normalizeDraft("draft")).toBeNull();
  });
});
