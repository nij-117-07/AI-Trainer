import { normalizeChallenge, normalizeSynthesis, sanitizeConfidence, sanitizeFocus, sanitizeMessages } from "./normalize";

describe("normalizeChallenge", () => {
  it("maps a 'None detected' fallacy check to null", () => {
    expect(
      normalizeChallenge({
        logicalFallacyCheck: "  None detected ",
        hiddenAssumption: " A ",
        strongestCounterargument: "C",
        bothSidesView: "B",
        probingQuestion: " Q ",
      }),
    ).toEqual({
      logicalFallacyCheck: null,
      hiddenAssumption: "A",
      strongestCounterargument: "C",
      bothSidesView: "B",
      probingQuestion: "Q",
    });
  });

  it("keeps a named fallacy", () => {
    expect(normalizeChallenge({ logicalFallacyCheck: "Ad Hominem", probingQuestion: "Q" }).logicalFallacyCheck).toBe(
      "Ad Hominem",
    );
  });

  it("rejects an empty challenge", () => {
    expect(() => normalizeChallenge({ logicalFallacyCheck: "Ad Hominem" })).toThrow("did not return a challenge");
  });
});

describe("normalizeSynthesis", () => {
  it("drops blank open questions", () => {
    expect(
      normalizeSynthesis({
        strongestCaseForUserView: "F",
        strongestCaseAgainstUserView: "A",
        sharedGround: "S",
        unresolvedQuestions: ["Q1", "  ", 3],
        refinedPosition: "R",
      }).unresolvedQuestions,
    ).toEqual(["Q1"]);
  });

  it("rejects an empty summary", () => {
    expect(() => normalizeSynthesis({ sharedGround: "S" })).toThrow("did not return a summary");
  });
});

describe("sanitizeMessages", () => {
  it("keeps only well-formed messages and marks the wrap-up", () => {
    expect(
      sanitizeMessages([
        { role: "user", content: " Cats " },
        { role: "system", content: "x" },
        { role: "assistant", content: "", kind: "turn" },
        { role: "assistant", content: "Both sides", kind: "summary" },
        "oops",
      ]),
    ).toEqual([
      { role: "user", content: "Cats", kind: "turn" },
      { role: "assistant", content: "Both sides", kind: "summary" },
    ]);
  });

  it("returns an empty list for damaged data", () => {
    expect(sanitizeMessages({ role: "user" })).toEqual([]);
  });
});

describe("sanitizeConfidence", () => {
  it("accepts known levels and falls back to medium", () => {
    expect(sanitizeConfidence("certain")).toBe("certain");
    expect(sanitizeConfidence("sure")).toBe("medium");
  });
});

describe("sanitizeFocus", () => {
  it("accepts known focus modes and falls back to both sides", () => {
    expect(sanitizeFocus("assumptions")).toBe("assumptions");
    expect(sanitizeFocus("debate-me")).toBe("both-sides");
  });
});
