// src/features/challenges/lib/normalise.test.ts
import type { ChallengeFormValues } from "../types";
import { toChallenge, toChallengeDraft, toChallengeResult } from "./normalise";

const defaults: ChallengeFormValues = {
  topic: "SQL joins",
  challengeType: "solve",
  skillLevel: "beginner",
  timeMinutes: 30,
  numChallenges: 3,
  instructions: "",
};

describe("toChallengeResult", () => {
  it("returns empty values for a missing or non-object payload", () => {
    expect(toChallengeResult(null)).toEqual({ challenges: [], coachNote: "" });
    expect(toChallengeResult("oops")).toEqual({ challenges: [], coachNote: "" });
  });

  it("maps challenge fields and drops values that are not text or lists", () => {
    const result = toChallengeResult({
      challenges: [
        {
          title: " Join two tables ",
          prompt: "Write a join.",
          successCriteria: ["Returns 3 rows", 7, ""],
          hints: "start with FROM",
          estimatedMinutes: 12.4,
        },
        null,
      ],
      coachNote: "Go slowly.",
    });
    expect(result.coachNote).toBe("Go slowly.");
    expect(result.challenges[0]).toEqual({
      kept: false,
      title: "Join two tables",
      prompt: "Write a join.",
      successCriteria: ["Returns 3 rows"],
      hints: [],
      estimatedMinutes: 12,
    });
    expect(result.challenges[1].title).toBe("");
    expect(result.challenges[1].estimatedMinutes).toBeNull();
  });
});

describe("toChallenge", () => {
  it("defaults kept to false and keeps a stored true", () => {
    expect(toChallenge({ title: "A" }).kept).toBe(false);
    expect(toChallenge({ title: "A", kept: true }).kept).toBe(true);
  });
});

describe("toChallengeDraft", () => {
  it("falls back to defaults for a corrupt draft", () => {
    const draft = toChallengeDraft(
      { form: { challengeType: "quiz", skillLevel: "expert", timeMinutes: 45, numChallenges: 99, topic: 5 } },
      defaults,
    );
    expect(draft.form).toEqual({ ...defaults, numChallenges: 5 });
    expect(draft.result).toBeNull();
  });

  it("restores a saved result", () => {
    const draft = toChallengeDraft({ form: defaults, result: { challenges: [{ title: "A" }] } }, defaults);
    expect(draft.result?.challenges[0].title).toBe("A");
  });
});
