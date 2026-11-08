// src/features/bias-inoculator/lib/normalize.test.ts
import { normalizeScenario } from "./normalize";

describe("normalizeScenario", () => {
  it("keeps the requested bias and turns missing fields into empty text", () => {
    const scenario = normalizeScenario({ scenarioSetup: "  A stock is down 40%.  " }, "anchoring");
    expect(scenario).toEqual({
      targetBias: "anchoring",
      scenarioSetup: "A stock is down 40%.",
      intuitiveTrap: "",
      rationalAnalysis: "",
      realWorldApplication: "",
    });
  });
});
