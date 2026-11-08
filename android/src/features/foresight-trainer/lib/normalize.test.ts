// src/features/foresight-trainer/lib/normalize.test.ts
import {
  buildDecisionRecord,
  normalizeEvaluation,
  normalizeOptions,
  normalizeProgress,
  normalizeScene,
} from "./normalize";
import { restoreForm, restoreSession } from "./persistence";

describe("normalizeEvaluation", () => {
  it("clamps scores to 0-10 and fills missing dimensions with 5", () => {
    const result = normalizeEvaluation({
      scores: { foresight: 14, empathy: "3", creativity: -2, riskAwareness: "x" },
      overallScore: 7.5,
    });
    expect(result.scores).toEqual({
      foresight: 10,
      empathy: 3,
      creativity: 0,
      risk_awareness: 5,
      reasoning_quality: 5,
    });
    expect(result.overallScore).toBe(7.5);
  });

  it("guards list fields that the model left out", () => {
    const result = normalizeEvaluation({ strengths: "Clear logic" });
    expect(result.strengths).toEqual(["Clear logic"]);
    expect(result.blindSpots).toEqual([]);
  });
});

describe("normalizeOptions", () => {
  it("falls back to medium risk and moderate time for unknown values", () => {
    const [option] = normalizeOptions([
      { id: "A", title: "Call the board", riskLevel: "extreme", timeCost: "SLOW" },
    ]);
    expect(option.riskLevel).toBe("medium");
    expect(option.timeCost).toBe("slow");
  });

  it("drops entries that are not objects or have no content", () => {
    expect(normalizeOptions(["bad", { id: "B" }])).toEqual([]);
    expect(normalizeOptions({ id: "A" })).toEqual([]);
  });
});

describe("normalizeScene", () => {
  it("keeps the difficulty adjustment only when asked for it", () => {
    const raw = { sceneNarrative: "The door opens.", decisionPoint: "Speak?", timePressure: "", difficultyAdjustment: "Harder" };
    expect(normalizeScene(raw).difficultyAdjustment).toBeNull();
    expect(normalizeScene(raw, true).difficultyAdjustment).toBe("Harder");
  });
});

describe("normalizeProgress", () => {
  it("parses a JSON score trajectory and defaults the skill rating", () => {
    const result = normalizeProgress({
      scoreTrajectory: '{"foresight": [4, 6]}',
      skillAssessment: "Legendary",
    });
    expect(result.scoreTrajectory).toEqual({ foresight: [4, 6] });
    expect(result.skillAssessment).toBe("developing");
  });

  it("returns an empty trajectory when the text is not an object", () => {
    expect(normalizeProgress({ scoreTrajectory: "not json" }).scoreTrajectory).toEqual({});
  });
});

describe("buildDecisionRecord", () => {
  it("uses the first blind spot, or Unknown when there is none", () => {
    const evaluation = normalizeEvaluation({ blindSpots: [], thinkingPattern: "cautious optimizer" });
    const record = buildDecisionRecord(2, "B", evaluation);
    expect(record.keyBlindSpot).toBe("Unknown");
    expect(record.approachType).toBe("cautious optimizer");
    expect(record.sceneNumber).toBe(2);
  });
});

describe("restoreForm", () => {
  const defaults = { userContext: "Startup", mainTheme: "negotiation", difficulty: "intermediate", maxScenes: 5 };

  it("keeps saved fields of the right type and falls back for the rest", () => {
    expect(restoreForm(defaults, { mainTheme: "crisis", maxScenes: "9" })).toEqual({ ...defaults, mainTheme: "crisis" });
  });
});

describe("restoreSession", () => {
  it("returns null when the saved scene is missing", () => {
    expect(restoreSession({ theme: "x" })).toBeNull();
  });

  it("rebuilds the blueprint, options, and history", () => {
    const restored = restoreSession({
      theme: "crisis",
      blueprint: { setting: "Lab", hiddenVariables: ["Budget cut"] },
      maxScenes: 3,
      sceneNumber: 2,
      currentScene: { sceneNarrative: "Alarms.", decisionPoint: "Act?" },
      options: [{ id: "A", title: "Evacuate" }],
      decisionHistory: [{ sceneNumber: 1, choiceMade: "A", scores: { foresight: 8 } }],
      log: [{ role: "assistant", content: "Scene 1" }],
    });
    expect(restored?.blueprint.hiddenVariables).toEqual(["Budget cut"]);
    expect(restored?.options[0].title).toBe("Evacuate");
    expect(restored?.decisionHistory[0].scores).toEqual({ foresight: 8 });
    expect(restored?.sceneNumber).toBe(2);
    expect(restored?.scenarioComplete).toBe(false);
  });
});
