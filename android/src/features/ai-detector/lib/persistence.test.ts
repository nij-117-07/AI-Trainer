// src/features/ai-detector/lib/persistence.test.ts
import { INITIAL_WIZARD_DRAFT, parseDraft } from "./persistence";

const savedDetection = {
  aiScore: 0.6,
  verdict: "Mixed",
  reason: "Some patterns.",
  flaggedPatterns: ["Furthermore"],
  suggestedChanges: ["Shorten sentences"],
};

describe("parseDraft", () => {
  it("returns the empty draft for missing or non-object data", () => {
    expect(parseDraft(null)).toEqual(INITIAL_WIZARD_DRAFT);
    expect(parseDraft("garbage")).toEqual(INITIAL_WIZARD_DRAFT);
  });

  it("restores a full saved draft", () => {
    const draft = parseDraft({
      step: "recheck",
      originalText: "Original",
      detect: savedDetection,
      humanize: { humanizedText: "Rewritten", changesMade: [], confidence: 0.7 },
      recheck: savedDetection,
    });
    expect(draft.step).toBe("recheck");
    expect(draft.originalText).toBe("Original");
    expect(draft.detect?.aiScore).toBe(0.6);
    expect(draft.humanize?.humanizedText).toBe("Rewritten");
    expect(draft.recheck?.verdict).toBe("Mixed");
  });

  it("falls back to detect for an unknown step", () => {
    expect(parseDraft({ step: "publish" }).step).toBe("detect");
  });

  it("drops damaged results instead of keeping them", () => {
    const draft = parseDraft({
      step: "humanize",
      detect: { aiScore: "nope" },
      humanize: { humanizedText: "" },
    });
    expect(draft.detect).toBeNull();
    expect(draft.humanize).toBeNull();
  });
});
