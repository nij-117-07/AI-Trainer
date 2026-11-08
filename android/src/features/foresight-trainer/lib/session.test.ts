// src/features/foresight-trainer/lib/session.test.ts
import { applyDecision, createSession, formatDecision, sceneMessage } from "./session";
import { normalizeConsequences, normalizeEvaluation, normalizeInsight, normalizeProgress } from "./normalize";
import type { DecisionOutcome, ForesightSession, StartResult } from "../types";

const start: StartResult = {
  scene: { sceneNarrative: "You stand in the lobby.", decisionPoint: "Call the investor?", timePressure: "Deadline at noon", difficultyAdjustment: null },
  options: [{ id: "A", title: "Call now", description: "Phone the investor.", approachType: "direct", riskLevel: "high", timeCost: "fast", hiddenTradeoff: "Less prep time" }],
  customOptionPrompt: "Write your own move.",
  blueprint: { setting: "Lobby", protagonist: "CEO", coreConflict: "Cash", stakes: "Payroll", thinkingSkill: "Negotiation", tone: "tense", hiddenVariables: ["Rival term sheet"] },
  maxScenes: 2,
};

function outcome(overrides: Partial<DecisionOutcome> = {}): DecisionOutcome {
  return {
    evaluation: normalizeEvaluation({ scores: { foresight: 7 }, overallScore: 7, blindSpots: ["Timing"], thinkingPattern: "bold" }),
    consequences: normalizeConsequences({ immediateEffects: ["Investor agrees"], worldStateUpdate: "Cash is safe" }),
    insight: normalizeInsight({ patternObservation: "You move quickly." }),
    scenarioComplete: false,
    decisionHistory: [],
    progressReport: null,
    nextScene: { sceneNarrative: "The rival calls.", decisionPoint: "Answer?", timePressure: "", difficultyAdjustment: "Harder" },
    nextOptions: [],
    customOptionPrompt: "Write your own.",
    ...overrides,
  };
}

describe("createSession", () => {
  it("starts on scene one with the opening scene in the transcript", () => {
    const session = createSession("negotiation", start);
    expect(session.sceneNumber).toBe(1);
    expect(session.decisionHistory).toEqual([]);
    expect(session.log[0].content).toBe(sceneMessage(1, start.scene));
  });
});

describe("applyDecision", () => {
  const base: ForesightSession = createSession("negotiation", start);

  it("moves to the next scene and keeps the old options when none come back", () => {
    const next = applyDecision(base, outcome({ decisionHistory: [{ sceneNumber: 1, choiceMade: "A", approachType: "bold", scores: {}, thinkingPattern: "bold", keyBlindSpot: "Timing" }] }));
    expect(next.sceneNumber).toBe(2);
    expect(next.currentScene.decisionPoint).toBe("Answer?");
    expect(next.options).toEqual(base.options);
    expect(next.decisionHistory).toHaveLength(1);
    expect(next.log.map((entry) => entry.role)).toEqual(["assistant", "assistant", "assistant"]);
  });

  it("finishes the scenario and appends the progress report", () => {
    const progress = normalizeProgress({ overallGrowth: "Better.", archetype: "The Bold Analyst", skillAssessment: "competent" });
    const done = applyDecision(base, outcome({ scenarioComplete: true, progressReport: progress, nextScene: null }));
    expect(done.scenarioComplete).toBe(true);
    expect(done.progressReport?.archetype).toBe("The Bold Analyst");
    expect(done.log[done.log.length - 1].content).toContain("**Progress report**");
  });
});

describe("formatDecision", () => {
  it("lists the scores and the coaching question", () => {
    const text = formatDecision(outcome({ insight: normalizeInsight({ coachingQuestion: "What if you waited?" }) }));
    expect(text).toContain("**foresight**: 7/10");
    expect(text).toContain("What if you waited?");
  });
});
