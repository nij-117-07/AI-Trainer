// src/features/ai-detector/lib/analysis.test.ts
import { formatScore, riskTone, verdictTone } from "./analysis";

describe("score formatting and colour bands", () => {
  it("formats the score as a rounded percentage", () => {
    expect(formatScore(0.666)).toBe("67% AI");
  });

  it("colours AI likelihood so high is bad", () => {
    expect(riskTone(0.9)).toBe("rose");
    expect(riskTone(0.5)).toBe("amber");
    expect(riskTone(0.1)).toBe("emerald");
  });

  it("colours verdicts", () => {
    expect(verdictTone("Likely AI")).toBe("rose");
    expect(verdictTone("Likely Human")).toBe("emerald");
    expect(verdictTone("Mixed")).toBe("amber");
  });
});
