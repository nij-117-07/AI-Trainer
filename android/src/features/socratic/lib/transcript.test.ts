import { formatChallenge, formatHistory, toHistory } from "./transcript";

describe("formatChallenge", () => {
  it("reports a fallacy when one is named", () => {
    const text = formatChallenge({
      logicalFallacyCheck: "Strawman",
      falsificationQuestion: "What evidence would prove you wrong?",
      edgeCaseScenario: "What if the sample is tiny?",
      refinedPerspective: "A more nuanced way to look at this might be...",
    });
    expect(text.split("\n\n")).toEqual([
      "**Logical fallacy detected:** Strawman",
      "**Falsification question:** What evidence would prove you wrong?",
      "**Edge case to consider:** What if the sample is tiny?",
      "**Refined perspective:** A more nuanced way to look at this might be...",
    ]);
  });

  it("says none detected when there is no fallacy", () => {
    const text = formatChallenge({
      logicalFallacyCheck: null,
      falsificationQuestion: "Q",
      edgeCaseScenario: "E",
      refinedPerspective: "R",
    });
    expect(text.startsWith("**Logical fallacy check:** None detected")).toBe(true);
  });
});

describe("toHistory", () => {
  it("labels user and challenger lines", () => {
    expect(
      toHistory([
        { role: "user", content: "Cats are best" },
        { role: "assistant", content: "Why?" },
      ]),
    ).toEqual(["User: Cats are best", "AI: Why?"]);
  });
});

describe("formatHistory", () => {
  it("reads empty history as no prior history", () => {
    expect(formatHistory([])).toBe("No prior history.");
  });

  it("joins exchanges one per line", () => {
    expect(formatHistory(["User: a", "AI: b"])).toBe("User: a\nAI: b");
  });
});
