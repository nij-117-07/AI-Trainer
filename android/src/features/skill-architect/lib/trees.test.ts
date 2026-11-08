// src/features/skill-architect/lib/trees.test.ts
import type { SkillArchitectResponse, SkillArchitectTree } from "../types";
import {
  buildTree,
  createTreeId,
  findTree,
  parseStoredTrees,
  removeTree,
  shortDate,
  sortTrees,
  treeStats,
  upsertTree,
} from "./trees";

const RESPONSE: SkillArchitectResponse = {
  corePhilosophy: "Core",
  skillTreeLevels: [
    {
      levelName: "Roots",
      rootSkills: ["A", "B"],
      howItWorks: "",
      proofOfMastery: "",
      unlockCondition: "",
    },
    {
      levelName: "Trunk",
      rootSkills: ["C"],
      howItWorks: "",
      proofOfMastery: "",
      unlockCondition: "",
    },
  ],
  criticalBottleneck: "",
  strategicNavigation: "",
};

function tree(id: string, updatedAt: string): SkillArchitectTree {
  return { id, topic: `Topic ${id}`, createdAt: updatedAt, updatedAt, response: RESPONSE };
}

describe("createTreeId", () => {
  it("combines the timestamp and random part", () => {
    expect(createTreeId(36, () => 0.5)).toMatch(/^10-[a-z0-9]+$/);
  });
});

describe("buildTree", () => {
  it("trims the topic and stamps both dates", () => {
    const built = buildTree({ id: "t1", topic: "  Rust  ", response: RESPONSE, now: "2026-11-08T10:00:00.000Z" });
    expect(built).toEqual({
      id: "t1",
      topic: "Rust",
      createdAt: "2026-11-08T10:00:00.000Z",
      updatedAt: "2026-11-08T10:00:00.000Z",
      response: RESPONSE,
    });
  });
});

describe("treeStats", () => {
  it("counts levels and root skills", () => {
    expect(treeStats(tree("a", "2026-01-01T00:00:00Z"))).toEqual({ levelCount: 2, rootSkillCount: 3 });
  });
});

describe("list operations", () => {
  const older = tree("old", "2026-01-01T00:00:00Z");
  const newer = tree("new", "2026-06-01T00:00:00Z");

  it("sorts most recently updated first without mutating the input", () => {
    const input = [older, newer];
    expect(sortTrees(input).map((item) => item.id)).toEqual(["new", "old"]);
    expect(input[0].id).toBe("old");
  });

  it("upserts by id and keeps the list sorted", () => {
    const updated = { ...older, topic: "Renamed", updatedAt: "2026-12-01T00:00:00Z" };
    const result = upsertTree([newer, older], updated);
    expect(result.map((item) => item.id)).toEqual(["old", "new"]);
    expect(result[0].topic).toBe("Renamed");
  });

  it("removes and finds trees by id", () => {
    const list = [older, newer];
    expect(removeTree(list, "old").map((item) => item.id)).toEqual(["new"]);
    expect(findTree(list, "new")?.id).toBe("new");
    expect(findTree(list, "missing")).toBeUndefined();
  });

  it("shortens ISO dates to the day", () => {
    expect(shortDate("2026-11-08T10:00:00.000Z")).toBe("2026-11-08");
  });
});

describe("parseStoredTrees", () => {
  it("drops corrupt entries and normalises the rest", () => {
    const parsed = parseStoredTrees([
      null,
      { id: "", topic: "No id" },
      { id: "x", topic: "  ", updatedAt: "2026-01-01" },
      {
        id: "good",
        topic: "Good",
        updatedAt: "2026-02-01T00:00:00Z",
        response: { skillTreeLevels: [{ level_name: "L1", root_skills: ["R"] }] },
      },
    ]);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe("good");
    expect(parsed[0].createdAt).toBe("2026-02-01T00:00:00Z");
    expect(parsed[0].response.skillTreeLevels[0].rootSkills).toEqual(["R"]);
  });

  it("returns an empty list for non-array storage", () => {
    expect(parseStoredTrees({ id: "x" })).toEqual([]);
    expect(parseStoredTrees(null)).toEqual([]);
  });
});
