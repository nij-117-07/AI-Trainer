// src/features/battleground/lib/normalize.test.ts
import { normalizeEvaluation, normalizeHealth, normalizeOpponent, normalizeProfile } from "./normalize";

describe("normalizeProfile", () => {
  it("falls back to the callsign and empty lists when the model omits fields", () => {
    const profile = normalizeProfile({ strengths: ["Log analysis", "  "] }, "Commander");
    expect(profile.callsign).toBe("Commander");
    expect(profile.strengths).toEqual(["Log analysis"]);
    expect(profile.availableLoadout).toEqual([]);
  });

  it("accepts a missing profile", () => {
    expect(normalizeProfile(undefined, "Viper").callsign).toBe("Viper");
  });
});

describe("normalizeOpponent", () => {
  it("reads capabilities from a JSON string and names the adversary by default", () => {
    const opponent = normalizeOpponent({ capabilities: '{"evasion": 8, "infiltration": "9"}' });
    expect(opponent.name).toBe("The adversary");
    expect(opponent.capabilities).toEqual({ evasion: "8", infiltration: "9" });
  });
});

describe("normalizeHealth", () => {
  it("clamps into range and uses the fallback for missing values", () => {
    expect(normalizeHealth(140, 100, 50, 100)).toBe(100);
    expect(normalizeHealth(10, 100, 50, 100)).toBe(50);
    expect(normalizeHealth(undefined, 80, 60, 100)).toBe(80);
  });
});

describe("normalizeEvaluation", () => {
  it("clamps score and damage deltas to the backend ranges", () => {
    const evaluation = normalizeEvaluation({
      score: 1.4,
      healthImpactUser: -90,
      healthImpactOpponent: 5,
      isTerminated: "yes",
      resourceImpact: '{"Threat intel feed": -1}',
    });
    expect(evaluation.score).toBe(1);
    expect(evaluation.hpDeltaUser).toBe(-50);
    expect(evaluation.hpDeltaOpponent).toBe(0);
    expect(evaluation.isTerminated).toBe(true);
    expect(evaluation.resourceImpact).toEqual({ "Threat intel feed": -1 });
  });

  it("uses neutral defaults for an empty result", () => {
    const evaluation = normalizeEvaluation({});
    expect(evaluation.score).toBe(0.5);
    expect(evaluation.hpDeltaUser).toBe(0);
    expect(evaluation.isTerminated).toBe(false);
    expect(evaluation.resourceImpact).toEqual({});
  });
});
