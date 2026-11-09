import { formatChallenge, formatHistory, formatSynthesis, toHistory } from "./transcript";

describe("formatChallenge", () => {
  it("lists each part in order, ending with the question", () => {
    const text = formatChallenge({
      logicalFallacyCheck: "Strawman",
      hiddenAssumption: "Tiny samples are unreliable.",
      strongestCounterargument: "Small samples can still be representative.",
      bothSidesView: "A more nuanced way to see this is ...",
      probingQuestion: "What evidence would change your mind?",
    });
    expect(text.split("\n\n")).toEqual([
      "**Fallacy check:** Strawman",
      "**Hidden assumption:** Tiny samples are unreliable.",
      "**Strongest case against it:** Small samples can still be representative.",
      "**Both sides:** A more nuanced way to see this is ...",
      "**Question for you:** What evidence would change your mind?",
    ]);
  });

  it("says none detected when there is no fallacy", () => {
    const text = formatChallenge({
      logicalFallacyCheck: null,
      hiddenAssumption: "",
      strongestCounterargument: "",
      bothSidesView: "",
      probingQuestion: "Q",
    });
    expect(text).toBe("**Fallacy check:** None detected\n\n**Question for you:** Q");
  });
});

describe("formatSynthesis", () => {
  it("renders open questions as a list", () => {
    const text = formatSynthesis({
      strongestCaseForUserView: "For",
      strongestCaseAgainstUserView: "Against",
      sharedGround: "Both agree on X.",
      unresolvedQuestions: ["Q1", "Q2"],
      refinedPosition: "I now think ...",
    });
    expect(text).toContain("**Still open:**\n\n- Q1\n- Q2");
    expect(text.endsWith("**Refined position:** I now think ...")).toBe(true);
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
