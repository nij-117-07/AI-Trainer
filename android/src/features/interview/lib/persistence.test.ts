import { DEFAULT_SETUP_FORM } from "../options";
import { mergeSavedSetup, restoreSession } from "./persistence";
import { createSession } from "./session-model";
import { validateSetup } from "./validate";

describe("mergeSavedSetup", () => {
  it("keeps saved values whose type matches the default", () => {
    const merged = mergeSavedSetup({ candidateName: "Ravi", maxQuestions: "many" });
    expect(merged.candidateName).toBe("Ravi");
    expect(merged.maxQuestions).toBe(DEFAULT_SETUP_FORM.maxQuestions);
    expect(merged.positionRole).toBe(DEFAULT_SETUP_FORM.positionRole);
  });

  it("returns the defaults for a damaged draft", () => {
    expect(mergeSavedSetup("broken")).toEqual(DEFAULT_SETUP_FORM);
  });
});

describe("restoreSession", () => {
  it("round-trips a saved session through JSON", () => {
    const state = createSession(validateSetup(DEFAULT_SETUP_FORM), "2026-11-08T10:00:00.000Z");
    const restored = restoreSession(JSON.parse(JSON.stringify(state)));
    expect(restored).toEqual(state);
  });

  it("returns null for data that is not a session", () => {
    expect(restoreSession(null)).toBeNull();
    expect(restoreSession({ stage: "decide" })).toBeNull();
    expect(restoreSession({ ...createSession(validateSetup(DEFAULT_SETUP_FORM), "x"), stage: "dance" })).toBeNull();
  });
});
