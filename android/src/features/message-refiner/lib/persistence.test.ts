import { MESSAGE_REFINER_DEFAULTS, restoreForm, restoreRefinement } from "./persistence";

describe("message refiner persistence", () => {
  it("falls back to defaults for a damaged form", () => {
    expect(restoreForm(null)).toEqual(MESSAGE_REFINER_DEFAULTS);
    expect(restoreForm({ message: 5, tone: "rude", audience: "boss" })).toEqual({
      message: "",
      tone: "friendly",
      audience: "boss",
      goal: "",
    });
  });

  it("keeps a valid saved tone", () => {
    expect(restoreForm({ tone: "concise" }).tone).toBe("concise");
  });

  it("returns null when no result is stored", () => {
    expect(restoreRefinement({ form: {} })).toBeNull();
    expect(restoreRefinement("bad")).toBeNull();
  });

  it("keeps a result whose message was edited down to empty", () => {
    const saved = restoreRefinement({ form: {}, result: { refinedMessage: "", subjectLine: "", changes: [] } });
    expect(saved?.result.refinedMessage).toBe("");
  });

  it("restores a saved refinement with its changes", () => {
    const saved = restoreRefinement({
      form: { message: "hi", tone: "professional" },
      result: { refinedMessage: "Hello, ...", subjectLine: "Meeting", changes: ["Added a greeting", "  "] },
    });
    expect(saved?.form.tone).toBe("professional");
    expect(saved?.result).toEqual({ refinedMessage: "Hello, ...", subjectLine: "Meeting", changes: ["Added a greeting"] });
  });
});
