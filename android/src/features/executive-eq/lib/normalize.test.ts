// src/features/executive-eq/lib/normalize.test.ts
import { normalizeEvaluation, normalizeScenario, normalizeTurn } from "./normalize";
import { restoreForm, restoreSession } from "./persistence";

describe("normalizeEvaluation", () => {
  it("falls back to backend defaults for unknown status and grade", () => {
    const result = normalizeEvaluation({ statusImpact: "Soared", strategicGrade: "Z" });
    expect(result.statusImpact).toBe("Maintained");
    expect(result.strategicGrade).toBe("C");
  });

  it("matches enum values case-insensitively and guards list fields", () => {
    const result = normalizeEvaluation({
      statusImpact: "completely lost",
      strategicGrade: "b",
      strengths: ["  Calm tone  ", 42, ""],
      criticalFlaws: "Too defensive\nGave away too much",
    });
    expect(result.statusImpact).toBe("Completely Lost");
    expect(result.strategicGrade).toBe("B");
    expect(result.strengths).toEqual(["Calm tone"]);
    expect(result.criticalFlaws).toEqual(["Too defensive", "Gave away too much"]);
  });
});

describe("normalizeScenario", () => {
  it("reads the NPC profile safely when the model omits it", () => {
    const result = normalizeScenario({ scenarioTitle: "Project Nightfall", npcProfile: "unexpected" });
    expect(result.scenarioTitle).toBe("Project Nightfall");
    expect(result.npcProfile.hiddenMotive).toBe("");
  });
});

describe("normalizeTurn", () => {
  it("returns an empty list when the strategies are missing", () => {
    expect(normalizeTurn({ npcDialogue: "We need to talk." }).suggestedStrategies).toEqual([]);
  });
});

describe("restoreSession", () => {
  it("returns null for damaged or missing data", () => {
    expect(restoreSession(null)).toBeNull();
    expect(restoreSession({ scenario: "bad" })).toBeNull();
  });

  it("restores a saved session and drops malformed entries", () => {
    const restored = restoreSession({
      scenario: { scenarioTitle: "Board Room", npcProfile: { name: "Ada" } },
      learningFocus: "strategic_ambiguity",
      narrativeArc: "Delay launch",
      chatHistory: [{ role: "npc", content: "Hello" }, null],
      log: [{ role: "user", content: "Hi" }],
      grades: [{ strategicGrade: "A" }, "bad"],
      lastBriefing: null,
    });
    expect(restored?.scenario.npcProfile.name).toBe("Ada");
    expect(restored?.chatHistory).toEqual([{ role: "npc", content: "Hello" }]);
    expect(restored?.log).toEqual([{ role: "user", content: "Hi" }]);
    expect(restored?.grades.map((grade) => grade.strategicGrade)).toEqual(["A"]);
  });
});

describe("restoreForm", () => {
  const defaults = { userRole: "CTO", narrativeArc: "Delay", learningFocus: "strategic_ambiguity", difficultyLevel: "Seasoned Exec", industryContext: "" };

  it("keeps saved string fields and falls back for the rest", () => {
    expect(restoreForm(defaults, { userRole: "CEO", industryContext: 5 })).toEqual({ ...defaults, userRole: "CEO" });
  });
});
