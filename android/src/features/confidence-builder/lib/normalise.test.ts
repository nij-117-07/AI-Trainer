// src/features/confidence-builder/lib/normalise.test.ts
import type { ConfidenceFormValues } from "../types";
import { toConfidenceSet, toConfidenceTaskResult } from "./normalise";

const defaults: ConfidenceFormValues = {
  focus: "speak-up",
  situation: "",
  comfort: "low",
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

describe("toConfidenceSet", () => {
  it("falls back to defaults for a corrupt form and keeps the saved tasks", () => {
    const set = toConfidenceSet(
      {
        id: "set-1",
        form: { focus: "shouting", comfort: "none", situation: 5, numTasks: 40 },
        result: { tasks: [{ title: "Ask one question" }] },
        updatedAt: "2026-11-01T10:00:00.000Z",
      },
      defaults,
    );
    expect(set?.id).toBe("set-1");
    expect(set?.form).toEqual(defaults);
    expect(set?.result.tasks.map((task) => task.title)).toEqual(["Ask one question"]);
    expect(set?.createdAt).toBe("2026-11-01T10:00:00.000Z");
  });

  it("drops an entry without an id", () => {
    expect(toConfidenceSet({ form: defaults }, defaults)).toBeNull();
  });
});
