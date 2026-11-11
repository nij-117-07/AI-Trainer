// src/features/skill-architect/lib/selection.test.ts
import type { SkillLevel } from "../types";
import { findSkill, parseSkillRef, skillStatus } from "./selection";

const LEVELS: SkillLevel[] = [
  { levelName: "Roots", rootSkills: ["A", "B"], howItWorks: "", proofOfMastery: "", unlockCondition: "" },
  { levelName: "Trunk", rootSkills: ["C"], howItWorks: "", proofOfMastery: "", unlockCondition: "" },
];

describe("parseSkillRef", () => {
  it("reads whole-number indexes from route params", () => {
    expect(parseSkillRef({ level: "1", skill: "0" })).toEqual({ level: 1, skill: 0 });
  });

  it("returns null when a param is missing or not a valid index", () => {
    expect(parseSkillRef({})).toBeNull();
    expect(parseSkillRef({ level: "1" })).toBeNull();
    expect(parseSkillRef({ level: "x", skill: "0" })).toBeNull();
    expect(parseSkillRef({ level: "-1", skill: "0" })).toBeNull();
  });
});

describe("findSkill", () => {
  it("returns the skill at the reference", () => {
    expect(findSkill(LEVELS, { level: 0, skill: 1 })).toEqual({
      levelIndex: 0,
      skillIndex: 1,
      level: LEVELS[0],
      skill: "B",
    });
  });

  it("returns null when the reference is out of range", () => {
    expect(findSkill(LEVELS, { level: 2, skill: 0 })).toBeNull();
    expect(findSkill(LEVELS, { level: 0, skill: 5 })).toBeNull();
    expect(findSkill(LEVELS, null)).toBeNull();
  });
});

describe("skillStatus", () => {
  it("is learned when the skill is ticked", () => {
    expect(skillStatus(LEVELS[0], "A", ["A"])).toBe("learned");
  });

  it("is in progress when another skill in the same level is learned", () => {
    expect(skillStatus(LEVELS[0], "B", ["A"])).toBe("inProgress");
  });

  it("is not started when nothing in the level is learned", () => {
    expect(skillStatus(LEVELS[1], "C", ["A"])).toBe("notStarted");
  });
});
