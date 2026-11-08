// src/features/skill-architect/lib/validate.test.ts
import { requireText, validateSkillArchitectRequest } from "./validate";

const VALID = {
  domainOrSkill: "  Docker  ",
  currentProficiency: "self-taught",
  targetMasteryLevel: "Industry Expert",
  learningConstraints: "",
};

describe("requireText", () => {
  it("trims the value", () => {
    expect(requireText("  hello  ", "Topic", 3, 10)).toBe("hello");
  });

  it("rejects empty and too-short values", () => {
    expect(() => requireText("   ", "Topic", 3, 10)).toThrow("Topic is required.");
    expect(() => requireText("ab", "Topic", 3, 10)).toThrow("Topic must be at least 3 characters.");
  });

  it("rejects values over the maximum", () => {
    expect(() => requireText("abcdefghijk", "Topic", 3, 10)).toThrow("Topic must be 10 characters or fewer.");
  });
});

describe("validateSkillArchitectRequest", () => {
  it("returns trimmed values and drops empty constraints", () => {
    expect(validateSkillArchitectRequest(VALID)).toEqual({
      domainOrSkill: "Docker",
      currentProficiency: "self-taught",
      targetMasteryLevel: "Industry Expert",
      learningConstraints: undefined,
    });
  });

  it("keeps trimmed constraints", () => {
    const request = validateSkillArchitectRequest({ ...VALID, learningConstraints: " 5 hours a week " });
    expect(request.learningConstraints).toBe("5 hours a week");
  });

  it("rejects constraints longer than 1000 characters", () => {
    expect(() =>
      validateSkillArchitectRequest({ ...VALID, learningConstraints: "x".repeat(1001) }),
    ).toThrow("Learning constraints must be 1000 characters or fewer.");
  });

  it("requires the domain", () => {
    expect(() => validateSkillArchitectRequest({ ...VALID, domainOrSkill: "" })).toThrow("Domain or skill is required.");
  });
});
