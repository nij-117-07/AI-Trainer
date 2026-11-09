// src/features/tasks/types.ts

/** 1 is the most urgent, 4 is the default. */
export type TaskPriority = 1 | 2 | 3 | 4;

export type TaskView = "inbox" | "today" | "upcoming" | "completed";

export type Recurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface NamedItem {
  id: string;
  name: string;
  createdAt: string;
}

export type Project = NamedItem;
export type Label = NamedItem;

export interface Task {
  id: string;
  title: string;
  notes: string;
  /** Local calendar day as YYYY-MM-DD, or null when no date is set. */
  dueDate: string | null;
  priority: TaskPriority;
  projectId: string | null;
  labelIds: string[];
  subtasks: Subtask[];
  recurrence: Recurrence;
  /** Local reminder time as an ISO string, or null when no reminder is set. */
  reminderAt: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskPatch = Partial<Omit<Task, "id" | "createdAt" | "completed" | "completedAt">>;

/** Which tasks a view shows. A null project or label means "any". */
export interface TaskFilter {
  view: TaskView;
  projectId: string | null;
  labelId: string | null;
}
