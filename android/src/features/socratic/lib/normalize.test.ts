import { normalizeChallenge, sanitizeConfidence, sanitizeMessages } from "./normalize";

describe("normalizeChallenge", () => {
  it("maps an empty fallacy check to null", () => {
    expect(
      normalizeChallenge({
        logicalFallacyCheck: "  ",
        falsificationQuestion: " Q ",
        edgeCaseScenario: "E",
        refinedPerspective: "R",
      }),
    ).toEqual({ logicalFallacyCheck: null, falsificationQuestion: "Q", edgeCaseScenario: "E", refinedPerspective: "R" });
  });

  it("rejects an empty challenge", () => {
    expect(() => normalizeChallenge({ logicalFallacyCheck: "Ad Hominem" })).toThrow("did not return a challenge");
  });
});

describe("sanitizeMessages", () => {
  it("keeps only well-formed messages", () => {
    expect(
      sanitizeMessages([
        { role: "user", content: " Cats " },
        { role: "system", content: "x" },
        { role: "assistant", content: "" },
        "oops",
      ]),
    ).toEqual([{ role: "user", content: "Cats" }]);
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
