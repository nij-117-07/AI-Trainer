import { DEFAULT_OBSERVATION_FORM } from "../options";
import { parseSavedForm } from "./persistence";

describe("parseSavedForm", () => {
  it("returns the defaults when nothing is saved", () => {
    expect(parseSavedForm(null)).toEqual(DEFAULT_OBSERVATION_FORM);
  });

  it("keeps saved values that match the field types", () => {
    expect(parseSavedForm({ trainingScenario: "Lab", revealHidden: false })).toEqual({
      ...DEFAULT_OBSERVATION_FORM,
      trainingScenario: "Lab",
      revealHidden: false,
    });
  });

  it("falls back to the default for a value of the wrong type", () => {
    expect(parseSavedForm({ userObservations: 42, revealHidden: "yes" })).toEqual(DEFAULT_OBSERVATION_FORM);
  });
});
