// src/features/social-posts/lib/persistence.test.ts
import { mergeSavedForm } from "./persistence";

const DEFAULTS = { platform: "LinkedIn", numSuggestions: 3 };

describe("mergeSavedForm", () => {
  it("keeps saved fields whose type matches the default", () => {
    expect(mergeSavedForm(DEFAULTS, { platform: "X", numSuggestions: 5 })).toEqual({
      platform: "X",
      numSuggestions: 5,
    });
  });

  it("falls back to the default for damaged or missing fields", () => {
    expect(mergeSavedForm(DEFAULTS, { platform: 7 })).toEqual(DEFAULTS);
    expect(mergeSavedForm(DEFAULTS, "not a record")).toEqual(DEFAULTS);
    expect(mergeSavedForm(DEFAULTS, null)).toEqual(DEFAULTS);
  });
});
