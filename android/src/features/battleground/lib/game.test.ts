// src/features/battleground/lib/game.test.ts
import { averageScore, createSession, finishRound, resolveRound } from "./game";
import type { BattleChallenge, BattleEvaluation, BattleSetup } from "../types";

const challenge: BattleChallenge = {
  tacticType: "ambush",
  briefing: "Alerts spike.",
  tacticalSituation: "Visibility is degrading.",
  challenge: "Restore visibility.",
  question: "Where do you hold?",
  constraints: ["Resolve within 4 hours"],
  referenceMaterial: { system_logs: "Auth failures." },
  updatedLearningLog: "Target hesitates.",
  environmentChange: "No significant changes.",
};

const setup: BattleSetup = {
  userProfile: {
    callsign: "Viper",
    rank: "Major",
    specializations: [],
    strengths: [],
    weaknesses: [],
    availableLoadout: ["EDR tools", "Threat intel feed"],
    combatDoctrine: "",
  },
  opponentProfile: {
    name: "Sovereign",
    title: "",
    capabilities: {},
    motives: "",
    personality: [],
    adaptabilityStyle: "",
    signatureTactics: [],
    weaknesses: [],
    availableResources: [],
  },
  opponentStrategy: "Sow chaos.",
  opponentFirstImpression: "Defensive target.",
  scenarioContext: "At 0200 the SIEM flags an encryption wave.",
  battlefieldEnvironment: { terrain: "Hybrid estate" },
  evaluationCriteria: { tactical_accuracy: "How well the response addresses the threat" },
  missionObjective: "Stop the wave.",
  rulesOfEngagement: ["Minimize downtime"],
  initialUserHealth: 90,
  initialOpponentHealth: 95,
};

function evaluation(overrides: Partial<BattleEvaluation> = {}): BattleEvaluation {
  return {
    score: 0.6,
    feedback: "",
    narrative: "",
    battlefieldShift: "",
    hpDeltaUser: -15,
    hpDeltaOpponent: -20,
    resourceImpact: {},
    isTerminated: false,
    terminationReason: "",
    ...overrides,
  };
}

describe("createSession", () => {
  it("starts at round one with one unit of each loadout item", () => {
    const session = createSession("Ransomware", "hard", setup, challenge);
    expect(session.roundNumber).toBe(1);
    expect(session.userHealth).toBe(90);
    expect(session.userResources).toEqual({ "EDR tools": 1, "Threat intel feed": 1 });
    expect(session.opponentLearningLog).toBe("Target hesitates.");
    expect(session.isActive).toBe(true);
  });
});

describe("resolveRound", () => {
  const session = createSession("Ransomware", "medium", setup, challenge);

  it("applies deltas and keeps the battle going while both sides stand", () => {
    const outcome = resolveRound(session, evaluation());
    expect(outcome).toEqual({ userHealth: 75, opponentHealth: 75, terminated: false, terminationReason: "" });
  });

  it("ends the mission when the user runs out of health", () => {
    const outcome = resolveRound(session, evaluation({ hpDeltaUser: -50 }));
    expect(outcome.userHealth).toBe(40);
    const dead = resolveRound({ ...session, userHealth: 20 }, evaluation({ hpDeltaUser: -50 }));
    expect(dead.terminated).toBe(true);
    expect(dead.terminationReason).toBe("Your forces were overwhelmed and the mission is lost.");
  });

  it("ends the mission on victory and prefers the adjudicator's reason", () => {
    const won = resolveRound({ ...session, opponentHealth: 10 }, evaluation({ hpDeltaOpponent: -30 }));
    expect(won.terminationReason).toBe("The opponent is eliminated. Mission accomplished.");
    const stopped = resolveRound(session, evaluation({ isTerminated: true, terminationReason: "Evidence lost." }));
    expect(stopped.terminated).toBe(true);
    expect(stopped.terminationReason).toBe("Evidence lost.");
  });
});

describe("finishRound", () => {
  it("advances the round, records the score, and swaps in the next challenge", () => {
    const session = createSession("Ransomware", "medium", setup, challenge);
    const evaluated = evaluation({ score: 0.8 });
    const next = { ...challenge, updatedLearningLog: "New log." };
    const updated = finishRound(session, "Isolate the host", {
      evaluation: evaluated,
      outcome: resolveRound(session, evaluated),
      nextChallenge: next,
    });
    expect(updated.roundNumber).toBe(2);
    expect(updated.roundScores).toEqual([0.8]);
    expect(updated.opponentLearningLog).toBe("New log.");
    expect(updated.lastUserAction).toBe("Isolate the host");
    expect(updated.isActive).toBe(true);
  });

  it("records each resolved round with its briefing, answer, and evaluation", () => {
    const session = createSession("Ransomware", "medium", setup, challenge);
    const evaluated = evaluation({ score: 0.8 });
    const updated = finishRound(session, "Isolate the host", {
      evaluation: evaluated,
      outcome: resolveRound(session, evaluated),
      nextChallenge: challenge,
    });
    expect(updated.rounds).toEqual([{ challenge, answer: "Isolate the host", evaluation: evaluated }]);
  });

  it("closes the session without a next challenge", () => {
    const session = createSession("Ransomware", "medium", setup, challenge);
    const finalEval = evaluation({ isTerminated: true, terminationReason: "Done." });
    const updated = finishRound(session, "Pay the ransom", {
      evaluation: finalEval,
      outcome: resolveRound(session, finalEval),
      nextChallenge: null,
    });
    expect(updated.isActive).toBe(false);
    expect(updated.currentChallenge).toBeNull();
    expect(updated.roundNumber).toBe(1);
    expect(updated.terminationReason).toBe("Done.");
  });
});

describe("averageScore", () => {
  it("returns zero before any round and the mean afterwards", () => {
    expect(averageScore([])).toBe(0);
    expect(averageScore([0.5, 1])).toBe(0.75);
  });
});
