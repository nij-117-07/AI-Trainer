// src/features/tasks/lib/tasks.test.ts
import type { Task } from "../types";
import {
  createTask,
  dueDateOptions,
  filterTasks,
  formatDueDate,
  normalizeTasks,
  sortOpenTasks,
  subtaskProgress,
  toggleTaskCompletion,
} from "./tasks";

function task(overrides: Partial<Task>): Task {
  return {
    id: "t",
    title: "Task",
    notes: "",
    dueDate: null,
    priority: 4,
    projectId: null,
    labelIds: [],
    subtasks: [],
    recurrence: "none",
    reminderAt: null,
    completed: false,
    completedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const ALL = { view: "inbox", projectId: null, labelId: null } as const;

describe("createTask", () => {
  it("trims the title and starts open with no repeat or reminder", () => {
    const created = createTask({ title: "  Buy milk ", dueDate: null, priority: 2, now: new Date(2026, 0, 1) });
    expect(created.title).toBe("Buy milk");
    expect(created.completed).toBe(false);
    expect(created.recurrence).toBe("none");
    expect(created.reminderAt).toBeNull();
    expect(created.subtasks).toEqual([]);
  });
});

describe("normalizeTasks", () => {
  it("returns an empty list for non-array data", () => {
    expect(normalizeTasks(null)).toEqual([]);
    expect(normalizeTasks({})).toEqual([]);
  });

  it("drops entries without an id or title and repairs bad fields", () => {
    const result = normalizeTasks([
      { id: "a", title: "Ok", dueDate: "not-a-date", priority: 9, completed: "yes", recurrence: "hourly" },
      { id: "b", title: "   " },
      { title: "No id" },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "a",
      dueDate: null,
      priority: 4,
      completed: false,
      completedAt: null,
      recurrence: "none",
      labelIds: [],
      subtasks: [],
    });
  });

  it("keeps valid subtasks, labels, project, recurrence, and reminder", () => {
    const [restored] = normalizeTasks([
      {
        id: "a",
        title: "Plan",
        projectId: "p1",
        labelIds: ["l1", 4],
        subtasks: [{ id: "s1", title: " step ", completed: true }, { id: "s2" }],
        recurrence: "weekly",
        reminderAt: "2026-02-01T09:00:00.000Z",
      },
    ]);
    expect(restored).toMatchObject({
      projectId: "p1",
      labelIds: ["l1"],
      subtasks: [{ id: "s1", title: "step", completed: true }],
      recurrence: "weekly",
      reminderAt: "2026-02-01T09:00:00.000Z",
    });
  });
});

describe("filterTasks", () => {
  const today = "2026-01-10";
  const tasks = [
    task({ id: "overdue", dueDate: "2026-01-08", projectId: "work", labelIds: ["urgent"] }),
    task({ id: "today", dueDate: "2026-01-10" }),
    task({ id: "later", dueDate: "2026-01-12", projectId: "home" }),
    task({ id: "someday" }),
    task({ id: "done", completed: true, completedAt: "2026-01-09T10:00:00.000Z" }),
  ];

  it("inbox shows every open task", () => {
    expect(filterTasks(tasks, ALL, today).map((t) => t.id)).toEqual(["overdue", "today", "later", "someday"]);
  });

  it("today includes overdue and due-today tasks", () => {
    expect(filterTasks(tasks, { ...ALL, view: "today" }, today).map((t) => t.id)).toEqual(["overdue", "today"]);
  });

  it("upcoming shows only future-dated open tasks", () => {
    expect(filterTasks(tasks, { ...ALL, view: "upcoming" }, today).map((t) => t.id)).toEqual(["later"]);
  });

  it("completed shows finished tasks, newest first", () => {
    const more = [...tasks, task({ id: "newer", completed: true, completedAt: "2026-01-09T12:00:00.000Z" })];
    expect(filterTasks(more, { ...ALL, view: "completed" }, today).map((t) => t.id)).toEqual(["newer", "done"]);
  });

  it("narrows by project and by label", () => {
    expect(filterTasks(tasks, { ...ALL, projectId: "work" }, today).map((t) => t.id)).toEqual(["overdue"]);
    expect(filterTasks(tasks, { ...ALL, labelId: "urgent" }, today).map((t) => t.id)).toEqual(["overdue"]);
  });
});

describe("sortOpenTasks", () => {
  it("orders by due date, then priority", () => {
    const sorted = sortOpenTasks([
      task({ id: "none-p1", priority: 1 }),
      task({ id: "late", dueDate: "2026-02-01", priority: 1 }),
      task({ id: "early-p3", dueDate: "2026-01-01", priority: 3 }),
      task({ id: "early-p1", dueDate: "2026-01-01", priority: 1 }),
    ]);
    expect(sorted.map((t) => t.id)).toEqual(["early-p1", "early-p3", "late", "none-p1"]);
  });
});

describe("toggleTaskCompletion", () => {
  const now = new Date(2026, 0, 10, 12, 0);

  it("completes an open task and reopens a completed one", () => {
    const done = toggleTaskCompletion(task({}), "2026-01-10", now);
    expect(done).toMatchObject({ completed: true, completedAt: now.toISOString() });
    expect(toggleTaskCompletion(done, "2026-01-10", now)).toMatchObject({ completed: false, completedAt: null });
  });

  it("moves a daily task to the next day and keeps it open", () => {
    const next = toggleTaskCompletion(task({ dueDate: "2026-01-10", recurrence: "daily" }), "2026-01-10", now);
    expect(next).toMatchObject({ completed: false, dueDate: "2026-01-11" });
  });

  it("skips past occurrences for an overdue repeating task", () => {
    const next = toggleTaskCompletion(task({ dueDate: "2026-01-08", recurrence: "daily" }), "2026-01-10", now);
    expect(next.dueDate).toBe("2026-01-11");
  });

  it("shifts the reminder with the due date and resets subtasks", () => {
    const reminder = new Date(2026, 0, 10, 9, 0).toISOString();
    const next = toggleTaskCompletion(
      task({
        dueDate: "2026-01-10",
        recurrence: "weekly",
        reminderAt: reminder,
        subtasks: [{ id: "s", title: "step", completed: true }],
      }),
      "2026-01-10",
      now
    );
    expect(next.dueDate).toBe("2026-01-17");
    expect(next.reminderAt).toBe(new Date(2026, 0, 17, 9, 0).toISOString());
    expect(next.subtasks[0].completed).toBe(false);
  });
});

describe("subtaskProgress", () => {
  it("counts finished subtasks", () => {
    const progress = subtaskProgress(
      task({
        subtasks: [
          { id: "a", title: "one", completed: true },
          { id: "b", title: "two", completed: false },
        ],
      })
    );
    expect(progress).toEqual({ done: 1, total: 2 });
  });
});

describe("dueDateOptions", () => {
  it("offers no date, today, tomorrow, and next week", () => {
    const options = dueDateOptions(new Date(2026, 0, 10));
    expect(options.map((o) => o.value)).toEqual(["none", "2026-01-10", "2026-01-11", "2026-01-17"]);
  });
});

describe("formatDueDate", () => {
  it("labels today and overdue dates", () => {
    expect(formatDueDate("2026-01-10", "2026-01-10")).toBe("Today");
    expect(formatDueDate("2026-01-08", "2026-01-10")).toMatch(/^Overdue · /);
  });
});
