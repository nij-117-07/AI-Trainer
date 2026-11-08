// src/features/testing-portal/lib/past-questions.test.ts
import { PAST_QUESTIONS_LIMIT, recentPastQuestions } from "./past-questions";

describe("recentPastQuestions", () => {
  it("returns nothing for blank input", () => {
    expect(recentPastQuestions("  \n\n ")).toEqual([]);
  });

  it("trims lines and keeps only the most recent entries", () => {
    const lines = Array.from({ length: PAST_QUESTIONS_LIMIT + 2 }, (_, i) => `  Q${i + 1}  `);
    const result = recentPastQuestions(lines.join("\r\n"));
    expect(result).toHaveLength(PAST_QUESTIONS_LIMIT);
    expect(result[0]).toBe("Q3");
    expect(result[result.length - 1]).toBe(`Q${PAST_QUESTIONS_LIMIT + 2}`);
  });
});
