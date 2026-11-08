// src/features/rewriter/lib/persistence.test.ts
import { mergeSavedForm } from "./persistence";

const DEFAULTS = { targetTone: "witty", audience: "software engineers" };

describe("mergeSavedForm", () => {
  it("returns the defaults when nothing usable was saved", () => {
    expect(mergeSavedForm(DEFAULTS, undefined)).toEqual(DEFAULTS);
    expect(mergeSavedForm(DEFAULTS, "draft")).toEqual(DEFAULTS);
  });

  it("keeps saved fields that match the default type and ignores the rest", () => {
    expect(
      mergeSavedForm(DEFAULTS, { targetTone: "warm", audience: null }),
    ).toEqual({
      targetTone: "warm",
      audience: "software engineers",
    });
  });
});
