// src/features/tutor/lib/tutor-input.test.ts
import { DEFAULT_TUTOR_FORM } from "./options";
import { advanceTurn, buildTutorInput, parseTutorDraft, startFresh } from "./tutor-input";

const PERSONA = "You are a patient tutor who explains ideas clearly.";

describe("buildTutorInput", () => {
  it("trims values and drops an empty last topic", () => {
    const input = buildTutorInput(
      { ...DEFAULT_TUTOR_FORM, userQuery: "  Why is the sky blue?  ", lastTopicTaught: "   " },
      PERSONA,
    );
    expect(input.userQuery).toBe("Why is the sky blue?");
    expect(input.lastTopicTaught).toBeUndefined();
    expect(input.systemPrompt).toBe(PERSONA);
  });

  it("sends None when the scenario is left empty", () => {
    expect(buildTutorInput({ ...DEFAULT_TUTOR_FORM, userQuery: "Why?", currentScenario: " " }, PERSONA).currentScenario).toBe(
      "None",
    );
  });

  it("uses the webui minimum lengths", () => {
    expect(() => buildTutorInput({ ...DEFAULT_TUTOR_FORM, userQuery: "Why?" }, "short")).toThrow(
      "Persona must be at least 10 characters.",
    );
    expect(() => buildTutorInput({ ...DEFAULT_TUTOR_FORM, userQuery: "hi" }, PERSONA)).toThrow(
      "Your question must be at least 3 characters.",
    );
  });

  it("rejects a question that is required", () => {
    expect(() => buildTutorInput({ ...DEFAULT_TUTOR_FORM, userQuery: "  " }, PERSONA)).toThrow(
      "Your question is required.",
    );
  });

  it("rejects overlong scenario text", () => {
    expect(() =>
      buildTutorInput({ ...DEFAULT_TUTOR_FORM, userQuery: "Why?", currentScenario: "x".repeat(501) }, PERSONA),
    ).toThrow("Scenario must be 500 characters or fewer.");
  });
});

describe("advanceTurn", () => {
  it("moves the question to last topic taught and clears it", () => {
    const next = advanceTurn({ ...DEFAULT_TUTOR_FORM, userQuery: "  Why?  ", lastTopicTaught: "old" });
    expect(next.lastTopicTaught).toBe("Why?");
    expect(next.userQuery).toBe("");
  });
});

describe("startFresh", () => {
  it("clears the memory of the last topic and keeps the other fields", () => {
    const next = startFresh({ ...DEFAULT_TUTOR_FORM, lastTopicTaught: "Entropy", studentLevel: "Expert" });
    expect(next.lastTopicTaught).toBe("");
    expect(next.studentLevel).toBe("Expert");
  });
});

describe("parseTutorDraft", () => {
  it("falls back to defaults for missing or invalid data", () => {
    expect(parseTutorDraft(null, DEFAULT_TUTOR_FORM)).toEqual(DEFAULT_TUTOR_FORM);
    expect(parseTutorDraft("text", DEFAULT_TUTOR_FORM)).toEqual(DEFAULT_TUTOR_FORM);
  });

  it("keeps stored string fields and fills the rest from defaults", () => {
    const draft = parseTutorDraft({ userQuery: "Next?", studentLevel: 7 }, DEFAULT_TUTOR_FORM);
    expect(draft.userQuery).toBe("Next?");
    expect(draft.studentLevel).toBe(DEFAULT_TUTOR_FORM.studentLevel);
  });
});
