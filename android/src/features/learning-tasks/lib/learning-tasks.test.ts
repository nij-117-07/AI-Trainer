// src/features/learning-tasks/lib/learning-tasks.test.ts
import type { GuideTask } from "@/features/guides/types";
import type { LearningTask, TaskContext } from "../types";
import {
  appendTasks,
  describeAppend,
  listHistory,
  normalizeDraft,
  normalizeList,
  pickTasks,
  removeTask,
  toggleTask,
} from "./learning-tasks";

describe("pickTasks", () => {
  it("keeps only the ticked tasks, in order", () => {
    const tasks = [candidate("A"), candidate("B"), candidate("C")];
    expect(pickTasks(tasks, [true, false, true]).map((task) => task.title)).toEqual(["A", "C"]);
    expect(pickTasks(tasks, [false, false, false])).toEqual([]);
  });
});

function ctxFactory(): TaskContext {
  let counter = 0;
  return { now: "2026-01-02T00:00:00.000Z", newId: () => `id-${++counter}` };
}

function candidate(title: string): GuideTask {
  return { title, description: `${title} details`, difficulty: "Easy", learningOutcomes: ["Learn"], estimatedHours: 2 };
}

function listTask(id: string, title: string, done = false): LearningTask {
  return { ...candidate(title), id, done, addedAt: "2026-01-01T00:00:00.000Z" };
}

describe("appendTasks", () => {
  it("adds new tasks to the end, unticked, with ids and timestamps", () => {
    const result = appendTasks([listTask("a", "Setup")], [candidate("Routes")], ctxFactory());
    expect(result.added).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.tasks.map((task) => task.title)).toEqual(["Setup", "Routes"]);
    expect(result.tasks[1]).toMatchObject({ id: "id-1", done: false, addedAt: "2026-01-02T00:00:00.000Z" });
  });

  it("skips titles already on the list, ignoring case and spaces", () => {
    const result = appendTasks([listTask("a", "Setup")], [candidate("  setup "), candidate("Routes")], ctxFactory());
    expect(result.added).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.tasks).toHaveLength(2);
  });

  it("skips a repeat inside the same batch", () => {
    const result = appendTasks([], [candidate("Routes"), candidate("Routes")], ctxFactory());
    expect(result.added).toBe(1);
    expect(result.skipped).toBe(1);
  });
});

describe("list changes", () => {
  it("toggles one task and removes one task by id", () => {
    const list = [listTask("a", "Setup"), listTask("b", "Routes")];
    expect(toggleTask(list, "b")[1].done).toBe(true);
    expect(toggleTask(list, "b")[0].done).toBe(false);
    expect(removeTask(list, "a").map((task) => task.id)).toEqual(["b"]);
  });
});

describe("listHistory", () => {
  it("lists every title, one per line", () => {
    expect(listHistory([listTask("a", "Setup"), listTask("b", "Routes")])).toBe("Setup\nRoutes");
  });

  it("drops the oldest titles to stay under the limit", () => {
    const list = [listTask("a", "x".repeat(30)), listTask("b", "Routes")];
    expect(listHistory(list, 20)).toBe("Routes");
  });
});

describe("normalizeList", () => {
  it("keeps valid items and fills in missing fields", () => {
    const tasks = normalizeList([
      { id: "a", title: "Setup", done: true, learningOutcomes: ["x", 3], estimatedHours: "soon" },
      { title: "No id" },
      "junk",
    ]);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({ id: "a", title: "Setup", done: true, learningOutcomes: ["x"], estimatedHours: null });
  });

  it("returns an empty list for damaged data", () => {
    expect(normalizeList({ not: "a list" })).toEqual([]);
  });
});

describe("normalizeDraft", () => {
  it("uses defaults for missing or invalid fields", () => {
    const { form, batch } = normalizeDraft({ form: { subject: "Rust", currentLevel: "Wizard", count: 99 } });
    expect(form.subject).toBe("Rust");
    expect(form.goal).toBe("");
    expect(form.currentLevel).toBe("Beginner");
    expect(form.count).toBe(10);
    expect(batch).toBeNull();
  });

  it("restores a pending batch and drops it when it has no tasks", () => {
    const restored = normalizeDraft({ batch: { mentorFeedback: "Good", tasks: [{ title: "Routes" }] } });
    expect(restored.batch?.tasks[0].title).toBe("Routes");
    expect(normalizeDraft({ batch: { mentorFeedback: "", tasks: [] } }).batch).toBeNull();
  });
});

describe("describeAppend", () => {
  it("reports what was added and what was already there", () => {
    expect(describeAppend(2, 0)).toBe("Added 2 tasks to your list.");
    expect(describeAppend(1, 1)).toBe("Added 1 task to your list. 1 was already there.");
    expect(describeAppend(0, 2)).toBe("Those tasks are already in your list.");
  });
});
