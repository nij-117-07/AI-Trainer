// src/features/skill-architect/lib/progress.test.ts
import type { ProgressUpdateResult, SkillArchitectTree, SkillLevel } from "../types";
import {
  applyProgressUpdate,
  cleanLevels,
  levelProgress,
  reconcileCompleted,
  replaceLevels,
  toggleSkill,
  treeProgress,
} from "./progress";
import { normaliseProgressUpdate } from "./normalise";

const LEVELS: SkillLevel[] = [
  { levelName: "Roots", rootSkills: ["A", "B"], howItWorks: "", proofOfMastery: "", unlockCondition: "" },
  { levelName: "Trunk", rootSkills: ["C"], howItWorks: "", proofOfMastery: "", unlockCondition: "" },
];

function tree(completedSkills: string[] = []): SkillArchitectTree {
  return {
    id: "t",
    topic: "Topic",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    response: { corePhilosophy: "", skillTreeLevels: LEVELS, criticalBottleneck: "", strategicNavigation: "" },
    completedSkills,
    lastUpdate: null,
  };
}

const NOW = "2026-06-01T00:00:00Z";

describe("progress counts", () => {
  it("counts finished skills per level and for the whole tree", () => {
    expect(levelProgress(LEVELS[0], ["A", "Z"])).toEqual({ done: 1, total: 2 });
    expect(treeProgress(tree(["A", "C"]))).toEqual({ done: 2, total: 3 });
  });

  it("drops completed entries that no longer exist and repeats", () => {
    expect(reconcileCompleted(["A", "A", "Gone"], LEVELS)).toEqual(["A"]);
  });
});

describe("toggleSkill", () => {
  it("adds and then removes a skill", () => {
    const done = toggleSkill(tree(), "B", NOW);
    expect(done.completedSkills).toEqual(["B"]);
    expect(done.updatedAt).toBe(NOW);
    expect(toggleSkill(done, "B", NOW).completedSkills).toEqual([]);
  });
});

describe("saving edits", () => {
  it("trims names, drops empty skills, and keeps progress for skills that remain", () => {
    const edited = cleanLevels([{ ...LEVELS[0], levelName: "  Roots ", rootSkills: ["A ", "  ", "B"] }]);
    expect(edited[0].levelName).toBe("Roots");
    expect(edited[0].rootSkills).toEqual(["A", "B"]);

    const saved = replaceLevels(tree(["A", "C"]), [edited[0]], NOW);
    expect(saved.response.skillTreeLevels).toHaveLength(1);
    expect(saved.completedSkills).toEqual(["A"]);
  });
});

describe("applyProgressUpdate", () => {
  it("replaces the levels, keeps only known completed skills, and records the update", () => {
    const update: ProgressUpdateResult = {
      summary: "Solid start",
      skillTreeLevels: [{ ...LEVELS[0], rootSkills: ["A", "D"] }],
      completedSkills: ["A", "D", "C"],
      nextSteps: "Do D",
    };
    const next = applyProgressUpdate(tree(["B"]), update, "Finished A", NOW);
    expect(next.response.skillTreeLevels[0].rootSkills).toEqual(["A", "D"]);
    expect(next.completedSkills).toEqual(["A", "D"]);
    expect(next.lastUpdate).toEqual({ progressNote: "Finished A", summary: "Solid start", nextSteps: "Do D", createdAt: NOW });
  });
});

describe("normaliseProgressUpdate", () => {
  it("reads snake_case keys and fills missing fields", () => {
    const update = normaliseProgressUpdate({
      summary: "Good",
      skill_tree_levels: [{ level_name: "L1", root_skills: ["X", "  "] }],
      completed_skills: [" X "],
    });
    expect(update.skillTreeLevels[0].rootSkills).toEqual(["X"]);
    expect(update.completedSkills).toEqual(["X"]);
    expect(update.nextSteps).toBe("");
  });
});
