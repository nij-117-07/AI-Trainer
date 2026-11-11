// src/features/confidence-builder/lib/normalise.test.ts
import type { ConfidenceFormValues } from "../types";
import { toConfidenceDraft, toConfidenceTaskResult } from "./normalise";

const defaults: ConfidenceFormValues = {
  focus: "speak-up",
  situation: "",
  comfort: "low",
  numTasks: 3,
  instructions: "",
};

describe("toConfidenceTaskResult", () => {
  it("drops tasks without a title and keeps text steps", () => {
    const result = toConfidenceTaskResult({
      tasks: [
        { title: " Ask one question ", why: "Builds comfort.", steps: ["Write it", 4, ""], successSign: "Asked it." },
        { why: "No title" },
      ],
      coachNote: "Be kind.",
    });
    expect(result.tasks).toEqual([
      { title: "Ask one question", why: "Builds comfort.", steps: ["Write it"], successSign: "Asked it." },
    ]);
    expect(result.coachNote).toBe("Be kind.");
  });
});

describe("toConfidenceDraft", () => {
  it("falls back to defaults for a corrupt form and drops an empty result", () => {
    const draft = toConfidenceDraft(
      { form: { focus: "shouting", comfort: "none", numTasks: 40, situation: 5 }, result: { tasks: [] } },
      defaults,
    );
    expect(draft.form).toEqual({ ...defaults, numTasks: 5 });
    expect(draft.result).toBeNull();
  });
});
