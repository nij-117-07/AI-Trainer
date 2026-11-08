// src/features/guides/lib/normalize.test.ts
import {
  normalizeDailyPlan,
  normalizeGuideTasks,
  normalizeProjectBlueprint,
  normalizeProjects,
  normalizeTopics,
} from "./normalize";

describe("normalizeGuideTasks", () => {
  it("reads each task field and drops empty entries", () => {
    const result = normalizeGuideTasks({
      mentorFeedback: " Good start. ",
      taskList: [
        {
          title: "Build a router",
          description: "Create routes.",
          difficulty: "Easy",
          learningOutcomes: ["Routing", 7, " "],
          estimatedHours: "2.4",
        },
        { title: "", description: "" },
        "not an object",
      ],
    });
    expect(result.mentorFeedback).toBe("Good start.");
    expect(result.tasks).toEqual([
      {
        title: "Build a router",
        description: "Create routes.",
        difficulty: "Easy",
        learningOutcomes: ["Routing"],
        estimatedHours: 2,
      },
    ]);
  });

  it("returns empty values when the model omits fields", () => {
    expect(normalizeGuideTasks({})).toEqual({ mentorFeedback: "", tasks: [] });
  });
});

describe("normalizeDailyPlan", () => {
  it("accepts a roadmap given as a newline-separated string", () => {
    const result = normalizeDailyPlan({ structuredRoadmap: "Step one\n\nStep two" });
    expect(result.structuredRoadmap).toEqual(["Step one", "Step two"]);
    expect(result.learningObjective).toBe("");
  });

  it("returns an empty roadmap when the field is missing", () => {
    expect(normalizeDailyPlan({ learningObjective: "Learn hooks" }).structuredRoadmap).toEqual([]);
  });
});

describe("normalizeProjectBlueprint", () => {
  it("keeps the seed the app generated", () => {
    const result = normalizeProjectBlueprint({ projectName: "Ward Board", stretchGoals: null }, "AB12CD34");
    expect(result.projectName).toBe("Ward Board");
    expect(result.stretchGoals).toEqual([]);
    expect(result.randomSeed).toBe("AB12CD34");
  });
});

describe("normalizeTopics", () => {
  it("drops recommendations without a topic name", () => {
    const result = normalizeTopics({
      recommendations: [
        { topicName: "CSRF defences", reason: "Builds on routing." },
        { reason: "No name" },
      ],
    });
    expect(result.recommendations).toEqual([{ topicName: "CSRF defences", reason: "Builds on routing." }]);
  });

  it("returns no recommendations for a non-list value", () => {
    expect(normalizeTopics({ recommendations: "none" }).recommendations).toEqual([]);
  });
});

describe("normalizeProjects", () => {
  it("reads key features from a list or a string", () => {
    const result = normalizeProjects({
      briefStrategy: "Vector search cuts triage time.",
      projects: [
        { title: "Triage Search", problem: "Slow notes", keyFeatures: ["Ranking", "Filters"] },
        { title: "Notes Index", problem: "Lost notes", keyFeatures: "Tags\nExport" },
        { title: "", problem: "" },
      ],
    });
    expect(result.briefStrategy).toBe("Vector search cuts triage time.");
    expect(result.projects.map((project) => project.keyFeatures)).toEqual([
      ["Ranking", "Filters"],
      ["Tags", "Export"],
    ]);
  });

  it("returns an empty list when projects is missing", () => {
    expect(normalizeProjects({ briefStrategy: "x" })).toEqual({ briefStrategy: "x", projects: [] });
  });
});
