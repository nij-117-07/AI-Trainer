// src/features/motivation/lib/reflection-session.test.ts
import {
  advance,
  emptyReflectionSession,
  isLastStep,
  reflectionPhase,
  restoreReflectionSession,
  roundFor,
  stepLabel,
  submitAnswer,
  withAnswer,
} from "./reflection-session";

const PROMPTS = ["What drained you today?", "What helped?"];

describe("reflection steps", () => {
  it("opens the answer box, saves it, then moves to the next prompt", () => {
    let session = emptyReflectionSession(PROMPTS);
    expect(reflectionPhase(session)).toBe("answering");
    expect(stepLabel(session)).toBe("Prompt 1 of 2");

    session = withAnswer(session, "Meetings");
    expect(submitAnswer(session).submitted).toBe(true);
    session = submitAnswer(session);
    expect(reflectionPhase(session)).toBe("saved");

    session = advance(session);
    expect(stepLabel(session)).toBe("Prompt 2 of 2");
    expect(isLastStep(session)).toBe(true);
    expect(session.answers).toEqual(["Meetings", ""]);
  });

  it("does not submit a blank answer", () => {
    const session = withAnswer(emptyReflectionSession(PROMPTS), "   ");
    expect(reflectionPhase(submitAnswer(session))).toBe("answering");
  });

  it("finishes after the last saved answer", () => {
    let session = emptyReflectionSession(PROMPTS);
    session = submitAnswer(withAnswer(session, "A"));
    session = advance(session);
    session = submitAnswer(withAnswer(session, "B"));
    session = advance(session);
    expect(reflectionPhase(session)).toBe("finished");
    expect(session.answers).toEqual(["A", "B"]);
  });

  it("ignores edits once an answer is saved", () => {
    const saved = submitAnswer(withAnswer(emptyReflectionSession(PROMPTS), "First"));
    expect(withAnswer(saved, "Changed").answers[0]).toBe("First");
  });

  it("reports an empty phase when there are no prompts", () => {
    expect(reflectionPhase(emptyReflectionSession())).toBe("empty");
  });
});

describe("reflection restore", () => {
  it("keeps saved answers and the current step", () => {
    const restored = restoreReflectionSession({
      session: { prompts: PROMPTS, answers: ["Meetings", "Walk"], step: 1, submitted: true },
      savedAt: "2026-11-11T00:00:00.000Z",
    });
    expect(restored).toEqual({ prompts: PROMPTS, answers: ["Meetings", "Walk"], step: 1, submitted: true });
  });

  it("falls back to an empty round when the stored data is damaged", () => {
    expect(restoreReflectionSession("nope")).toEqual(emptyReflectionSession());
    const restored = restoreReflectionSession({ session: { prompts: [1, "Why?"], answers: 5, step: "x", submitted: "yes" } });
    expect(restored).toEqual({ prompts: ["Why?"], answers: [""], step: 0, submitted: false });
  });

  it("clamps a step beyond the prompts to the finished position", () => {
    const restored = restoreReflectionSession({ session: { prompts: PROMPTS, answers: ["A", "B"], step: 9, submitted: true } });
    expect(restored.step).toBe(2);
    expect(reflectionPhase(restored)).toBe("finished");
  });

  it("starts a new round when the prompts change", () => {
    const stored = submitAnswer(withAnswer(emptyReflectionSession(PROMPTS), "Old"));
    expect(roundFor(stored, PROMPTS)).toBe(stored);
    const fresh = roundFor(stored, ["A new prompt?"]);
    expect(fresh.prompts).toEqual(["A new prompt?"]);
    expect(fresh.answers).toEqual([""]);
    expect(reflectionPhase(fresh)).toBe("answering");
  });
});
