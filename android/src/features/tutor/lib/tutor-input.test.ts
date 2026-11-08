// src/features/tutor/lib/tutor-input.test.ts
import { DEFAULT_TUTOR_FORM } from "./options";
import { advanceTurn, buildTutorInput, parseTutorDraft } from "./tutor-input";

describe("buildTutorInput", () => {
  it("trims values and drops an empty last topic", () => {
    const input = buildTutorInput({
      ...DEFAULT_TUTOR_FORM,
      userQuery: "  Why is the sky blue?  ",
      lastTopicTaught: "   ",
    });
    expect(input.userQuery).toBe("Why is the sky blue?");
    expect(input.lastTopicTaught).toBeUndefined();
  });

  it("uses the webui minimum lengths", () => {
    expect(() => buildTutorInput({ ...DEFAULT_TUTOR_FORM, systemPrompt: "short" })).toThrow(
      "System prompt must be at least 10 characters.",
    );
    expect(() => buildTutorInput({ ...DEFAULT_TUTOR_FORM, userQuery: "hi" })).toThrow(
      "Your question must be at least 3 characters.",
    );
  });

  it("rejects a question that is required", () => {
    expect(() => buildTutorInput({ ...DEFAULT_TUTOR_FORM, userQuery: "  " })).toThrow("Your question is required.");
  });

  it("rejects overlong scenario text", () => {
    expect(() => buildTutorInput({ ...DEFAULT_TUTOR_FORM, currentScenario: "x".repeat(501) })).toThrow(
      "Current scenario must be 500 characters or fewer.",
    );
  });
});

describe("advanceTurn", () => {
  it("moves the question to last topic taught and clears it", () => {
    const next = advanceTurn({ ...DEFAULT_TUTOR_FORM, userQuery: "  Why?  ", lastTopicTaught: "old" });
    expect(next.lastTopicTaught).toBe("Why?");
    expect(next.userQuery).toBe("");
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
