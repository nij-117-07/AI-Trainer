// src/features/confidence-builder/lib/log.ts
/**
 * Rules for a practice round and the history. Each step returns a new log, so the hook can save it
 * as it changes. A round moves through: rate before, do the task, rate after and save.
 */
import type { ConfidenceFocus, ConfidenceLog, ConfidenceSummary, ConfidenceTask, Rating } from "../types";

export const EMPTY_LOG: ConfidenceLog = { entries: [], active: null };

export function startRound(log: ConfidenceLog, task: ConfidenceTask, focus: ConfidenceFocus, startedAt: string): ConfidenceLog {
  return {
    ...log,
    active: { task, focus, before: null, startedAt, doneAt: null, after: null, reflection: "" },
  };
}

export function rateBefore(log: ConfidenceLog, rating: Rating): ConfidenceLog {
  return log.active ? { ...log, active: { ...log.active, before: rating } } : log;
}

export function markDone(log: ConfidenceLog, doneAt: string): ConfidenceLog {
  return log.active && log.active.before !== null ? { ...log, active: { ...log.active, doneAt } } : log;
}

export function rateAfter(log: ConfidenceLog, rating: Rating): ConfidenceLog {
  return log.active ? { ...log, active: { ...log.active, after: rating } } : log;
}

export function setReflection(log: ConfidenceLog, reflection: string): ConfidenceLog {
  return log.active ? { ...log, active: { ...log.active, reflection } } : log;
}

export function dropRound(log: ConfidenceLog): ConfidenceLog {
  return { ...log, active: null };
}

/** Adds the finished round to the history. A round without both ratings and a finish time is left as it is. */
export function finishRound(log: ConfidenceLog, id: string, completedAt: string): ConfidenceLog {
  const round = log.active;
  if (!round || round.before === null || round.after === null || round.doneAt === null) return log;
  return {
    entries: [
      ...log.entries,
      {
        id,
        title: round.task.title,
        focus: round.focus,
        before: round.before,
        after: round.after,
        reflection: round.reflection.trim(),
        completedAt,
      },
    ],
    active: null,
  };
}

export function summarise(entries: ConfidenceLog["entries"]): ConfidenceSummary {
  const count = entries.length;
  const totalGain = entries.reduce((sum, entry) => sum + (entry.after - entry.before), 0);
  const days = new Set(entries.map((entry) => entry.completedAt.slice(0, 10))).size;
  return {
    count,
    averageGain: count === 0 ? null : Math.round((totalGain / count) * 10) / 10,
    daysPracticed: days,
  };
}
