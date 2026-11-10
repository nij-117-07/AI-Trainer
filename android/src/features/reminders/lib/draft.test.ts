import { REMINDER_DRAFT_DEFAULTS, restoreDraft } from "./draft";

describe("reminder draft", () => {
  it("uses defaults for a damaged draft", () => {
    expect(restoreDraft(null)).toEqual(REMINDER_DRAFT_DEFAULTS);
    expect(restoreDraft([])).toEqual(REMINDER_DRAFT_DEFAULTS);
  });

  it("keeps valid fields and drops bad ones", () => {
    const draft = restoreDraft({ name: 5, every: "3", unit: "weeks", windowStart: "09:00", weekdays: [1, 9, "x"] });
    expect(draft.name).toBe("");
    expect(draft.every).toBe("3");
    expect(draft.unit).toBe("hours");
    expect(draft.windowStart).toBe("09:00");
    expect(draft.windowEnd).toBe("");
    expect(draft.weekdays).toEqual([1]);
  });
});
