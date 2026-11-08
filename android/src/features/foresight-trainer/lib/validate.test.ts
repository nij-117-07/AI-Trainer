// src/features/foresight-trainer/lib/validate.test.ts
import { clampCount, requireOption, requireText } from "./validate";

describe("requireText", () => {
  it("rejects blank input and input over the limit", () => {
    expect(requireText(" strategic negotiation ", "Theme", 300)).toBe("strategic negotiation");
    expect(() => requireText("  ", "Theme", 300)).toThrow("Theme is required.");
    expect(() => requireText("x".repeat(3001), "Your context", 3000)).toThrow(
      "Your context must be 3000 characters or fewer.",
    );
  });
});

describe("requireOption", () => {
  it("accepts only the listed difficulties", () => {
    expect(requireOption("advanced", ["beginner", "intermediate", "advanced"], "Difficulty")).toBe("advanced");
    expect(() => requireOption("expert", ["beginner", "intermediate", "advanced"], "Difficulty")).toThrow();
  });
});

describe("clampCount", () => {
  it("rounds and keeps the scene count inside the range", () => {
    expect(clampCount(25, 1, 20)).toBe(20);
    expect(clampCount(0, 1, 20)).toBe(1);
    expect(clampCount(4.6, 1, 20)).toBe(5);
    expect(clampCount(Number.NaN, 1, 20)).toBe(1);
  });
});
