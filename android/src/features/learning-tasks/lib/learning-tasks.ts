// src/features/learning-tasks/lib/learning-tasks.ts
/**
 * Rules for Learning Tasks: the saved list, the saved generator draft, and how generated tasks
 * join the list. Stored JSON is not trusted, so every value is read through a normaliser.
 */
import { CURRENT_LEVELS } from "@/features/guides/options";
import { isRecord, listOf, numberOf, textOf } from "@/features/guides/lib/text";
import type { GuideTask, GuideTaskResult } from "@/features/guides/types";
import type { AppendResult, LearningTask, TaskContext, TaskFormValues } from "../types";

export const LEARNING_TASKS_LIST_KEY = "learning.learning-tasks.v1";
export const LEARNING_TASKS_DRAFT_KEY = "learning.learning-tasks-generator.v1";

export const TASK_FORM_DEFAULTS: TaskFormValues = {
  subject: "",
  goal: "",
  currentLevel: "Beginner",
  count: 3,
  instructions: "",
};

const HISTORY_LIMIT = 2000;
const TASK_COUNT_MAX = 10;

function textOr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeGuideTask(raw: unknown): GuideTask | null {
  if (!isRecord(raw)) return null;
  const title = textOf(raw.title).trim();
  const description = textOf(raw.description).trim();
  if (!title && !description) return null;
  return {
    title: title || "Untitled task",
    description,
    difficulty: textOf(raw.difficulty).trim(),
    learningOutcomes: listOf(raw.learningOutcomes)
      .map((item) => textOf(item).trim())
      .filter((item) => item !== ""),
    estimatedHours: numberOf(raw.estimatedHours),
  };
}

export function normalizeList(raw: unknown): LearningTask[] {
  return listOf(raw).flatMap((item) => {
    if (!isRecord(item)) return [];
    const task = normalizeGuideTask(item);
    const id = textOf(item.id);
    if (!task || !id) return [];
    return [{ ...task, id, done: item.done === true, addedAt: textOf(item.addedAt) }];
  });
}

export function normalizeDraft(raw: unknown): { form: TaskFormValues; batch: GuideTaskResult | null } {
  const saved = isRecord(raw) && isRecord(raw.form) ? raw.form : {};
  const level = textOr(saved.currentLevel, TASK_FORM_DEFAULTS.currentLevel);
  const count = numberOf(saved.count);
  const form: TaskFormValues = {
    subject: textOr(saved.subject, TASK_FORM_DEFAULTS.subject),
    goal: textOr(saved.goal, TASK_FORM_DEFAULTS.goal),
    currentLevel: (CURRENT_LEVELS as readonly string[]).includes(level) ? level : TASK_FORM_DEFAULTS.currentLevel,
    count: count === null ? TASK_FORM_DEFAULTS.count : Math.min(Math.max(Math.round(count), 1), TASK_COUNT_MAX),
    instructions: textOr(saved.instructions, TASK_FORM_DEFAULTS.instructions),
  };

  const rawBatch = isRecord(raw) ? raw.batch : null;
  const batch: GuideTaskResult | null = isRecord(rawBatch)
    ? {
        mentorFeedback: textOf(rawBatch.mentorFeedback),
        tasks: listOf(rawBatch.tasks).flatMap((item) => {
          const task = normalizeGuideTask(item);
          return task ? [task] : [];
        }),
      }
    : null;

  return { form, batch: batch && batch.tasks.length > 0 ? batch : null };
}

/** Every title already on the list, one per line, so the AI does not suggest them again. */
export function listHistory(tasks: LearningTask[], max = HISTORY_LIMIT): string {
  const titles = tasks.map((task) => task.title);
  let text = titles.join("\n");
  while (text.length > max && titles.length > 0) {
    titles.shift();
    text = titles.join("\n");
  }
  return text;
}

function keyOf(title: string): string {
  return title.trim().toLowerCase();
}

/** Adds generated tasks to the end of the list. A title already on the list is skipped. */
export function appendTasks(list: LearningTask[], candidates: GuideTask[], ctx: TaskContext): AppendResult {
  const seen = new Set(list.map((task) => keyOf(task.title)));
  const fresh: LearningTask[] = [];
  let skipped = 0;
  for (const candidate of candidates) {
    const key = keyOf(candidate.title);
    if (seen.has(key)) {
      skipped += 1;
      continue;
    }
    seen.add(key);
    fresh.push({ ...candidate, id: ctx.newId(), done: false, addedAt: ctx.now });
  }
  return { tasks: [...list, ...fresh], added: fresh.length, skipped };
}

/** The generated tasks the user ticked, in their original order. */
export function pickTasks(tasks: GuideTask[], selected: boolean[]): GuideTask[] {
  return tasks.filter((_, index) => selected[index] === true);
}

export function toggleTask(list: LearningTask[], id: string): LearningTask[] {
  return list.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
}

export function removeTask(list: LearningTask[], id: string): LearningTask[] {
  return list.filter((task) => task.id !== id);
}

export function describeAppend(added: number, skipped: number): string {
  if (added === 0) return "Those tasks are already in your list.";
  const addedText = `Added ${added} task${added === 1 ? "" : "s"} to your list.`;
  if (skipped === 0) return addedText;
  return `${addedText} ${skipped} ${skipped === 1 ? "was" : "were"} already there.`;
}
