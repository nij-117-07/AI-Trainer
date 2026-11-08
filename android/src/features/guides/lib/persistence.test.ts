// src/features/guides/lib/persistence.test.ts
import { mergeSavedForm } from "./persistence";

const DEFAULTS = { subject: "FastAPI", count: 3, instructions: "" };

describe("mergeSavedForm", () => {
  it("returns the defaults when nothing was saved", () => {
    expect(mergeSavedForm(DEFAULTS, null)).toEqual(DEFAULTS);
  });

  it("keeps saved values whose type matches the default", () => {
    expect(mergeSavedForm(DEFAULTS, { subject: "Django", count: 5 })).toEqual({
      subject: "Django",
      count: 5,
      instructions: "",
    });
  });

  it("falls back to the default for a field saved with the wrong type", () => {
    expect(mergeSavedForm(DEFAULTS, { count: "many", subject: 12 })).toEqual(DEFAULTS);
  });
});
