import { normalizeSubtopicDraft } from "./draft";

describe("subtopic-lister draft", () => {
  it("restores saved values and falls back for invalid ones", () => {
    const draft = normalizeSubtopicDraft({
      form: { topic: "Algebra", level: "expert", instructions: "Use examples" },
      result: null,
    });
    expect(draft.form).toEqual({ topic: "Algebra", level: "beginner", instructions: "Use examples" });
    expect(draft.result).toBeNull();
  });

  it("restores a saved result through the normaliser", () => {
    const draft = normalizeSubtopicDraft({
      form: {},
      result: { subtopics: [{ name: "Linear equations", description: "Solve for x." }, { name: "" }] },
    });
    expect(draft.result).toEqual({ subtopics: [{ name: "Linear equations", description: "Solve for x.", kept: false }] });
  });

  it("returns defaults for unreadable data", () => {
    const draft = normalizeSubtopicDraft("not a draft");
    expect(draft.form).toEqual({ topic: "", level: "beginner", instructions: "" });
    expect(draft.result).toBeNull();
  });
});
