// src/features/tutor/lib/response-versions.test.ts
import { clampVersionIndex, normalizeTutorResponse, parseStoredVersions } from "./response-versions";

describe("normalizeTutorResponse", () => {
  it("returns empty strings for missing or non-string fields", () => {
    expect(normalizeTutorResponse({ adaptedExplanation: 42, tutorFeedback: " Why? " })).toEqual({
      adaptedExplanation: "",
      conceptAnalogy: "",
      tutorFeedback: "Why?",
    });
  });

  it("handles a non-object model result", () => {
    expect(normalizeTutorResponse(undefined)).toEqual({
      adaptedExplanation: "",
      conceptAnalogy: "",
      tutorFeedback: "",
    });
  });
});

describe("parseStoredVersions", () => {
  it("returns an empty list for non-array data", () => {
    expect(parseStoredVersions("oops")).toEqual([]);
  });

  it("keeps only versions with some content", () => {
    const parsed = parseStoredVersions([
      { adaptedExplanation: "Water boils...", conceptAnalogy: "", tutorFeedback: "" },
      { adaptedExplanation: "", conceptAnalogy: "", tutorFeedback: "" },
      null,
    ]);
    expect(parsed).toEqual([{ adaptedExplanation: "Water boils...", conceptAnalogy: "", tutorFeedback: "" }]);
  });
});

describe("clampVersionIndex", () => {
  it("returns -1 when there are no versions", () => {
    expect(clampVersionIndex(0, 0)).toBe(-1);
  });

  it("keeps the index inside the list", () => {
    expect(clampVersionIndex(-3, 4)).toBe(0);
    expect(clampVersionIndex(9, 4)).toBe(3);
    expect(clampVersionIndex(2, 4)).toBe(2);
  });
});
