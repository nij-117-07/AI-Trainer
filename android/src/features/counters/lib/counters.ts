// src/features/counters/lib/counters.ts
/** Counter rules and safe reading of stored counters and countdowns. */
import type { Countdown, Counter, TimerState, TimerStatus } from "../types";

export const NAME_MAX = 80;
export const MAX_ITEMS = 50;
export const MAX_TARGET = 100000;

export interface CounterData {
  counters: Counter[];
  countdowns: Countdown[];
  /** Saved timer state per countdown id, so a running countdown survives closing the app. */
  timers: Record<string, TimerState>;
}

const TIMER_STATUSES: TimerStatus[] = ["idle", "running", "paused", "done"];

function normalizeTimers(value: unknown, validIds: Set<string>): Record<string, TimerState> {
  const timers: Record<string, TimerState> = {};
  if (typeof value !== "object" || value === null || Array.isArray(value)) return timers;
  for (const [id, raw] of Object.entries(value as Record<string, unknown>)) {
    if (!validIds.has(id) || typeof raw !== "object" || raw === null) continue;
    const timer = raw as Partial<TimerState>;
    if (!TIMER_STATUSES.includes(timer.status as TimerStatus)) continue;
    if (typeof timer.remainingMs !== "number" || !Number.isFinite(timer.remainingMs) || timer.remainingMs < 0) continue;
    const endsAt = typeof timer.endsAt === "number" && Number.isFinite(timer.endsAt) ? timer.endsAt : null;
    timers[id] = { status: timer.status as TimerStatus, remainingMs: timer.remainingMs, endsAt };
  }
  return timers;
}

export function parseTarget(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const target = Number(trimmed);
  if (target < 1 || target > MAX_TARGET) return null;
  return target;
}

export function adjustCount(count: number, delta: number): number {
  return Math.max(0, count + delta);
}

export function progressOf(count: number, target: number): number {
  return Math.min(1, count / target);
}

function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeCounterData(raw: unknown): CounterData {
  const record = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const createdFallback = new Date(0).toISOString();

  const counters = Array.isArray(record.counters)
    ? record.counters.flatMap((item): Counter[] => {
        if (typeof item !== "object" || item === null) return [];
        const raw = item as Partial<Counter>;
        const name = textOf(raw.name);
        if (typeof raw.id !== "string" || !name) return [];
        const target = typeof raw.target === "number" && Number.isInteger(raw.target) && raw.target >= 1 ? raw.target : null;
        if (target === null) return [];
        const count = typeof raw.count === "number" && Number.isInteger(raw.count) && raw.count >= 0 ? raw.count : 0;
        return [{ id: raw.id, name, target, count, createdAt: typeof raw.createdAt === "string" ? raw.createdAt : createdFallback }];
      })
    : [];

  const countdowns = Array.isArray(record.countdowns)
    ? record.countdowns.flatMap((item): Countdown[] => {
        if (typeof item !== "object" || item === null) return [];
        const raw = item as Partial<Countdown>;
        const name = textOf(raw.name);
        if (typeof raw.id !== "string" || !name) return [];
        const durationSec =
          typeof raw.durationSec === "number" && Number.isInteger(raw.durationSec) && raw.durationSec > 0 ? raw.durationSec : null;
        if (durationSec === null) return [];
        return [{ id: raw.id, name, durationSec, createdAt: typeof raw.createdAt === "string" ? raw.createdAt : createdFallback }];
      })
    : [];

  const ids = new Set(countdowns.map((countdown) => countdown.id));
  return { counters, countdowns, timers: normalizeTimers(record.timers, ids) };
}
