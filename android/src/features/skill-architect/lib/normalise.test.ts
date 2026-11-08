// src/features/skill-architect/lib/normalise.test.ts
import { listOf, normaliseFormDraft, normaliseLevels, normaliseResponse, textOf } from "./normalise";

describe("listOf and textOf", () => {
  it("returns an empty list for non-array values", () => {
    expect(listOf(undefined)).toEqual([]);
    expect(listOf("skill")).toEqual([]);
    expect(listOf({ a: 1 })).toEqual([]);
  });

  it("keeps arrays and coerces scalars to text", () => {
    expect(listOf([1, 2])).toEqual([1, 2]);
    expect(textOf("ok")).toBe("ok");
    expect(textOf(42)).toBe("42");
    expect(textOf(null)).toBe("");
    expect(textOf({})).toBe("");
  });
});

describe("normaliseLevels", () => {
  it("maps snake_case model keys and camelCase keys alike", () => {
    const levels = normaliseLevels([
      {
        level_name: "Level 1: The Roots",
        root_skills: ["Syntax", "Data types"],
        how_it_works: "Code is read top to bottom.",
        proof_of_mastery: "Build a calculator.",
        unlock_condition: "Pass the quiz.",
      },
      {
        levelName: "Level 2",
        rootSkills: ["Functions"],
        howItWorks: "Calls push frames.",
        proofOfMastery: "Refactor a script.",
        unlockCondition: "Two projects.",
      },
    ]);
    expect(levels[0]).toEqual({
      levelName: "Level 1: The Roots",
      rootSkills: ["Syntax", "Data types"],
      howItWorks: "Code is read top to bottom.",
      proofOfMastery: "Build a calculator.",
      unlockCondition: "Pass the quiz.",
    });
    expect(levels[1].rootSkills).toEqual(["Functions"]);
    expect(levels[1].unlockCondition).toBe("Two projects.");
  });

  it("fills missing fields and drops blank root skills", () => {
    const [level] = normaliseLevels([{ level_name: "Only a name", root_skills: ["Real", "  ", null] }]);
    expect(level).toEqual({
      levelName: "Only a name",
      rootSkills: ["Real"],
      howItWorks: "",
      proofOfMastery: "",
      unlockCondition: "",
    });
  });

  it("turns non-list and non-object input into safe values", () => {
    expect(normaliseLevels("oops")).toEqual([]);
    expect(normaliseLevels([null, "text"])).toEqual([
      { levelName: "", rootSkills: [], howItWorks: "", proofOfMastery: "", unlockCondition: "" },
      { levelName: "", rootSkills: [], howItWorks: "", proofOfMastery: "", unlockCondition: "" },
    ]);
  });
});

describe("normaliseResponse", () => {
  it("returns empty strings and levels for an empty model result", () => {
    expect(normaliseResponse(undefined)).toEqual({
      corePhilosophy: "",
      skillTreeLevels: [],
      criticalBottleneck: "",
      strategicNavigation: "",
    });
  });

  it("reads the Ax camelCase response fields", () => {
    const response = normaliseResponse({
      corePhilosophy: "Systems are made of parts.",
      skillTreeLevels: [],
      criticalBottleneck: "Abstraction",
      strategicNavigation: "Practise daily.",
    });
    expect(response.corePhilosophy).toBe("Systems are made of parts.");
    expect(response.criticalBottleneck).toBe("Abstraction");
    expect(response.strategicNavigation).toBe("Practise daily.");
  });
});

describe("normaliseFormDraft", () => {
  const defaults = {
    domainOrSkill: "Default domain",
    currentProficiency: "Default level",
    targetMasteryLevel: "Default target",
    learningConstraints: "",
  };

  it("uses defaults when no draft is stored", () => {
    expect(normaliseFormDraft(null, defaults)).toEqual(defaults);
  });

  it("keeps string fields from a stored draft", () => {
    expect(normaliseFormDraft({ domainOrSkill: "Rust", learningConstraints: 5 }, defaults)).toEqual({
      ...defaults,
      domainOrSkill: "Rust",
    });
  });
});
