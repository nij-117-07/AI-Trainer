// src/features/negotiation/lib/normalize.test.ts
import {
  formatHistory,
  historyOf,
  normalizeAnalysis,
  normalizeInternalPosition,
  normalizeReport,
  normalizeScenario,
  scenarioContextText,
} from "./normalize";
import { requireOption, requireText, throwIfAborted } from "./validate";

const SCENARIO_RAW = {
  title: "  Salary talk  ",
  context: "A senior engineer is negotiating an offer.",
  yourRole: "Candidate",
  yourGoal: "Base above $150k",
  yourConstraints: "Cannot start before June",
  opponentRole: "Hiring manager",
  opponentGoal: "Stay under budget",
  opponentConstraints: "Budget capped",
  keyIssues: ["base salary", " remote days ", ""],
  startingStanceOpponent: "Thanks for coming in. Our offer is $140k.",
};

describe("normalizeScenario", () => {
  it("trims text and keeps the key issues", () => {
    const scenario = normalizeScenario(SCENARIO_RAW);
    expect(scenario.title).toBe("Salary talk");
    expect(scenario.keyIssues).toEqual(["base salary", "remote days"]);
  });

  it("rejects a scenario without an opening message", () => {
    expect(() => normalizeScenario({ ...SCENARIO_RAW, startingStanceOpponent: "" })).toThrow(
      "without an opening message",
    );
  });
});

describe("normalizeInternalPosition", () => {
  it("clamps satisfaction and defaults the willingness to medium", () => {
    const position = normalizeInternalPosition({
      satisfaction: 14,
      willingnessToConcede: "Very",
      concessionsMade: "Lower the start date",
    });
    expect(position.satisfaction).toBe(10);
    expect(position.willingnessToConcede).toBe("medium");
    expect(position.concessionsMade).toEqual(["Lower the start date"]);
    expect(position.keyDemands).toEqual([]);
  });

  it("accepts the three willingness levels in any case", () => {
    expect(normalizeInternalPosition({ willingnessToConcede: "HIGH" }).willingnessToConcede).toBe("high");
  });
});

describe("normalizeAnalysis", () => {
  it("clamps the rating to 1-10 with a default of 5", () => {
    expect(normalizeAnalysis({ effectivenessRating: 0 }).effectivenessRating).toBe(1);
    expect(normalizeAnalysis({ effectivenessRating: 42 }).effectivenessRating).toBe(10);
    expect(normalizeAnalysis({}).effectivenessRating).toBe(5);
  });
});

describe("normalizeReport", () => {
  it("clamps the overall score to 0-100 and each category to 0-10", () => {
    const report = normalizeReport({
      overallScore: 180,
      scoresByCategory: { preparation: 12, communication: "x", strategy: 7 },
    });
    expect(report.overallScore).toBe(100);
    expect(report.scoresByCategory.preparation).toBe(10);
    expect(report.scoresByCategory.communication).toBe(5);
    expect(report.scoresByCategory.flexibility).toBe(5);
    expect(report.strengths).toEqual([]);
  });

  it("defaults the overall score to 50 when missing", () => {
    expect(normalizeReport({}).overallScore).toBe(50);
  });
});

describe("transcript helpers", () => {
  const log = [
    { role: "opponent" as const, text: "Opening offer." },
    { role: "user" as const, text: "I need more." },
    { role: "coach" as const, text: "Good anchoring." },
  ];

  it("leaves coach tips out of the transcript the model sees", () => {
    expect(historyOf(log)).toEqual([
      { role: "opponent", message: "Opening offer." },
      { role: "user", message: "I need more." },
    ]);
  });

  it("formats the transcript one turn per line", () => {
    expect(formatHistory(historyOf(log))).toBe("[opponent]: Opening offer.\n[user]: I need more.");
    expect(formatHistory([])).toBe("");
  });

  it("serialises the scenario with snake_case keys", () => {
    const scenario = normalizeScenario(SCENARIO_RAW);
    const parsed = JSON.parse(scenarioContextText(scenario));
    expect(parsed.your_role).toBe("Candidate");
    expect(parsed.starting_stance_opponent).toBe("Thanks for coming in. Our offer is $140k.");
  });
});

describe("negotiation validators", () => {
  it("requires a domain and a listed difficulty", () => {
    expect(() => requireText("  ", "Domain", 200)).toThrow("Domain is required.");
    expect(requireOption("advanced", ["beginner", "advanced"], "Difficulty")).toBe("advanced");
    expect(() => requireOption("expert", ["beginner", "advanced"], "Difficulty")).toThrow();
  });

  it("stops work once the signal is aborted", () => {
    const controller = new AbortController();
    controller.abort();
    expect(() => throwIfAborted(controller.signal)).toThrow("cancelled");
  });
});
