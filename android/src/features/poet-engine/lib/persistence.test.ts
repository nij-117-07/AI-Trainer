// src/features/poet-engine/lib/persistence.test.ts
import { mergeSavedForm } from "./persistence";

const DEFAULTS = { targetLanguage: "Urdu", userMood: "mystical" };

describe("mergeSavedForm", () => {
  it("returns the defaults when nothing usable was saved", () => {
    expect(mergeSavedForm(DEFAULTS, null)).toEqual(DEFAULTS);
    expect(mergeSavedForm(DEFAULTS, ["Persian"])).toEqual(DEFAULTS);
  });

  it("keeps saved fields that match the default type and ignores the rest", () => {
    expect(
      mergeSavedForm(DEFAULTS, { targetLanguage: "Persian", userMood: 3 }),
    ).toEqual({
      targetLanguage: "Persian",
      userMood: "mystical",
    });
  });
});
