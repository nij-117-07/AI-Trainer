// src/features/projects/lib/normalise.test.ts
import { toProjectDraft, toProjectIdea, toProjectResult } from "./normalise";
import type { ProjectFormValues } from "../types";

const defaults: ProjectFormValues = {
  topic: "Python web scraping",
  projectSize: "medium",
  difficultyLevel: "intermediate",
  numRecommendations: 3,
};

describe("toProjectResult", () => {
  it("returns empty values for a missing or non-object payload", () => {
    expect(toProjectResult(null)).toEqual({ projects: [], advice: "" });
    expect(toProjectResult("oops")).toEqual({ projects: [], advice: "" });
  });

  it("maps project fields and drops entries that are not lists", () => {
    const result = toProjectResult({
      projects: [
        {
          title: "Scraper",
          description: "Collect prices.",
          keyConcepts: ["HTTP", 7],
          estimatedHours: 12,
          prerequisites: "none",
          deliverables: ["CLI"],
        },
        null,
      ],
      advice: "Start small.",
    });
    expect(result.advice).toBe("Start small.");
    expect(result.projects[0]).toEqual({
      title: "Scraper",
      description: "Collect prices.",
      keyConcepts: ["HTTP", "7"],
      estimatedHours: 12,
      prerequisites: [],
      deliverables: ["CLI"],
      stretchGoals: [],
    });
    expect(result.projects[1].title).toBe("");
  });
});

describe("toProjectIdea", () => {
  it("treats a missing or non-numeric estimate as unknown", () => {
    expect(toProjectIdea({ estimatedHours: "soon" }).estimatedHours).toBeNull();
    expect(toProjectIdea({}).estimatedHours).toBeNull();
  });
});

describe("toProjectDraft", () => {
  it("falls back to defaults for a corrupt draft", () => {
    const draft = toProjectDraft({ form: { projectSize: "huge", numRecommendations: 99, topic: 5 } }, defaults);
    expect(draft.form).toEqual({
      topic: "Python web scraping",
      projectSize: "medium",
      difficultyLevel: "intermediate",
      numRecommendations: 10,
    });
    expect(draft.result).toBeNull();
  });

  it("restores a saved result", () => {
    const draft = toProjectDraft({ form: defaults, result: { projects: [{ title: "A" }] } }, defaults);
    expect(draft.result?.projects[0].title).toBe("A");
  });
});
