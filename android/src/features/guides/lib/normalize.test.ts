// src/features/guides/lib/normalize.test.ts
import { normalizeGuideTasks, normalizeTopics } from "./normalize";

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
