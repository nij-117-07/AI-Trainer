// src/features/tasks/lib/tasks.ts
/** Pure task logic: creating, normalising stored data, filtering views, sorting, and completion. */
import type { Recurrence, Subtask, Task, TaskFilter, TaskPriority, TaskView } from "../types";
import { addDays, dateKey, isDateKey } from "./dates";
import { newId } from "./ids";
import { nextOccurrenceAfter, shiftReminder } from "./recurrence";

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 1, label: "P1" },
  { value: 2, label: "P2" },
  { value: 3, label: "P3" },
  { value: 4, label: "P4" },
];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  1: "P1 Urgent",
  2: "P2 High",
  3: "P3 Medium",
  4: "P4 Normal",
};

export const VIEW_LABELS: Record<TaskView, string> = {
  inbox: "Inbox",
  today: "Today",
  upcoming: "Upcoming",
  completed: "Completed",
};

const PRIORITIES: TaskPriority[] = [1, 2, 3, 4];
const RECURRENCES: Recurrence[] = ["none", "daily", "weekly", "monthly", "yearly"];

export function createTask(input: {
  title: string;
  dueDate: string | null;
  priority: TaskPriority;
  projectId?: string | null;
  now?: Date;
}): Task {
  const now = input.now ?? new Date();
  const stamp = now.toISOString();
  return {
    id: newId(now.getTime()),
    title: input.title.trim(),
    notes: "",
    dueDate: input.dueDate,
    priority: input.priority,
    projectId: input.projectId ?? null,
    labelIds: [],
    subtasks: [],
    recurrence: "none",
    reminderAt: null,
    completed: false,
    completedAt: null,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function normalizeTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): Task[] => {
    if (!item || typeof item !== "object") return [];
    const raw = item as Partial<Record<keyof Task, unknown>>;
    if (typeof raw.id !== "string" || typeof raw.title !== "string" || !raw.title.trim()) return [];
    const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : new Date(0).toISOString();
    const completed = raw.completed === true;
    return [
      {
        id: raw.id,
        title: raw.title.trim(),
        notes: typeof raw.notes === "string" ? raw.notes : "",
        dueDate: isDateKey(raw.dueDate) ? raw.dueDate : null,
        priority: PRIORITIES.includes(raw.priority as TaskPriority) ? (raw.priority as TaskPriority) : 4,
        projectId: typeof raw.projectId === "string" ? raw.projectId : null,
        labelIds: Array.isArray(raw.labelIds) ? raw.labelIds.filter((id): id is string => typeof id === "string") : [],
        subtasks: normalizeSubtasks(raw.subtasks),
        recurrence: RECURRENCES.includes(raw.recurrence as Recurrence) ? (raw.recurrence as Recurrence) : "none",
        reminderAt:
          typeof raw.reminderAt === "string" && !Number.isNaN(Date.parse(raw.reminderAt)) ? raw.reminderAt : null,
        completed,
        completedAt: completed && typeof raw.completedAt === "string" ? raw.completedAt : null,
        createdAt,
        updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : createdAt,
      },
    ];
  });
}

function normalizeSubtasks(value: unknown): Subtask[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): Subtask[] => {
    if (!item || typeof item !== "object") return [];
    const raw = item as Partial<Record<keyof Subtask, unknown>>;
    if (typeof raw.id !== "string" || typeof raw.title !== "string" || !raw.title.trim()) return [];
    return [{ id: raw.id, title: raw.title.trim(), completed: raw.completed === true }];
  });
}

/** Open tasks first, then by due date (no date last), then by priority, then by creation time. */
export function sortOpenTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.dueDate !== b.dueDate) {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate < b.dueDate ? -1 : 1;
    }
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
  });
}

export function filterTasks(tasks: Task[], filter: TaskFilter, today: string): Task[] {
  const scoped = tasks.filter(
    (task) =>
      (filter.projectId === null || task.projectId === filter.projectId) &&
      (filter.labelId === null || task.labelIds.includes(filter.labelId))
  );
  if (filter.view === "completed") {
    return scoped
      .filter((task) => task.completed)
      .sort((a, b) => ((a.completedAt ?? "") < (b.completedAt ?? "") ? 1 : -1));
  }
  const open = sortOpenTasks(scoped.filter((task) => !task.completed));
  if (filter.view === "inbox") return open;
  if (filter.view === "today") return open.filter((task) => task.dueDate !== null && task.dueDate <= today);
  return open.filter((task) => task.dueDate !== null && task.dueDate > today);
}

/**
 * Completes an open task. A repeating task instead moves to its next occurrence, stays open,
 * and its subtasks are unchecked for the new round. Reopening a completed task clears its date.
 */
export function toggleTaskCompletion(task: Task, today: string, now: Date = new Date()): Task {
  const stamp = now.toISOString();
  if (task.completed) {
    return { ...task, completed: false, completedAt: null, updatedAt: stamp };
  }
  if (task.recurrence !== "none" && task.dueDate) {
    const nextDue = nextOccurrenceAfter(task.dueDate, task.recurrence, today);
    return {
      ...task,
      dueDate: nextDue,
      reminderAt: task.reminderAt ? shiftReminder(task.reminderAt, task.dueDate, nextDue) : null,
      subtasks: task.subtasks.map((subtask) => ({ ...subtask, completed: false })),
      updatedAt: stamp,
    };
  }
  return { ...task, completed: true, completedAt: stamp, updatedAt: stamp };
}

export function subtaskProgress(task: Task): { done: number; total: number } {
  return {
    done: task.subtasks.filter((subtask) => subtask.completed).length,
    total: task.subtasks.length,
  };
}

export function dueDateOptions(today: Date): { value: string; label: string }[] {
  return [
    { value: "none", label: "No date" },
    { value: dateKey(today), label: "Today" },
    { value: dateKey(addDays(today, 1)), label: "Tomorrow" },
    { value: dateKey(addDays(today, 7)), label: "Next week" },
  ];
}

export function formatDueDate(dueDate: string, today: string): string {
  if (dueDate === today) return "Today";
  if (dueDate < today) return `Overdue · ${formatDateKey(dueDate)}`;
  return formatDateKey(dueDate);
}

export function isOverdue(task: Task, today: string): boolean {
  return !task.completed && task.dueDate !== null && task.dueDate < today;
}

function formatDateKey(key: string): string {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
