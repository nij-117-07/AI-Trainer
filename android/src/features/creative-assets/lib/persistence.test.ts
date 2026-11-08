// src/features/creative-assets/lib/persistence.test.ts
import { mergeSavedForm } from "./persistence";

const DEFAULTS = { taskType: "Hashtags", numberOfSuggestions: 3 };

describe("mergeSavedForm", () => {
  it("keeps saved fields whose type matches the default", () => {
    expect(mergeSavedForm(DEFAULTS, { taskType: "Slogans", numberOfSuggestions: 8 })).toEqual({
      taskType: "Slogans",
      numberOfSuggestions: 8,
    });
  });

  it("falls back to the default for damaged or missing fields", () => {
    expect(mergeSavedForm(DEFAULTS, { numberOfSuggestions: "8" })).toEqual(DEFAULTS);
    expect(mergeSavedForm(DEFAULTS, undefined)).toEqual(DEFAULTS);
  });
});
