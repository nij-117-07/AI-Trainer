// src/features/debate/lib/normalize.test.ts
import { normalizePersona, normalizeTurn, normalizeVerdict } from "./normalize";

describe("normalizePersona", () => {
  it("keeps the profile and falls back to moderate stance", () => {
    const persona = normalizePersona({
      personaName: " Dr. Ledger ",
      systemPrompt: "You argue from incentives.",
      overallStance: "Aggressive",
      strategicPriorities: ["Cite costs", " "],
      coreValues: "Evidence",
    });
    expect(persona.personaName).toBe("Dr. Ledger");
    expect(persona.overallStance).toBe("aggressive");
    expect(persona.strategicPriorities).toEqual(["Cite costs"]);
    expect(persona.coreValues).toEqual(["Evidence"]);
    expect(persona.linguisticQuirks).toEqual([]);
  });

  it("uses moderate when the stance is unknown", () => {
    expect(normalizePersona({ overallStance: "bombastic" }).overallStance).toBe("moderate");
  });
});

describe("normalizeTurn", () => {
  it("reads every turn field and keeps devices as a list", () => {
    const turn = normalizeTurn({
      opponentAnalysis: "Weak on costs.",
      coreClaim: "UBI is affordable.",
      spokenArgument: "Consider the numbers.",
      rhetoricalDevices: ["Logos", "Ethos"],
      closingQuestion: "What does it cost?",
    });
    expect(turn.coreClaim).toBe("UBI is affordable.");
    expect(turn.rhetoricalDevices).toEqual(["Logos", "Ethos"]);
    expect(turn.reasoningAndEvidence).toBe("");
  });
});

describe("normalizeVerdict", () => {
  it("clamps scores and defaults missing scores to 5", () => {
    const verdict = normalizeVerdict({ proScore: 12, conScore: -3, winner: "pro" });
    expect(verdict.proScore).toBe(10);
    expect(verdict.conScore).toBe(0);
    expect(verdict.winner).toBe("pro");
    expect(normalizeVerdict({}).proScore).toBe(5);
  });

  it("falls back to a tie for an unknown winner and to pro for an unknown argument side", () => {
    const verdict = normalizeVerdict({
      winner: "draw",
      strongestArgument: { side: "neutral", claim: "Costs are modest." },
      weakestArgument: "not an object",
    });
    expect(verdict.winner).toBe("tie");
    expect(verdict.strongestArgument).toEqual({ side: "pro", claim: "Costs are modest." });
    expect(verdict.weakestArgument).toEqual({ side: "pro", claim: "" });
  });
});
