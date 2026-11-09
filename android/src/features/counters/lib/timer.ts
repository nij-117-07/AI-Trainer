// src/features/counters/lib/timer.ts
/**
 * Countdown timer rules. The timer stores when it will end, not a running tick count, so the
 * time left stays correct while the screen is busy or the app is in the background.
 */
import type { TimerState } from "../types";

export const MAX_DURATION_SEC = 99 * 3600 + 59 * 60 + 59;

export function idleTimer(durationMs: number): TimerState {
  return { status: "idle", remainingMs: durationMs, endsAt: null };
}

export function startTimer(state: TimerState, now: number): TimerState {
  if (state.status === "running" || state.remainingMs <= 0) return state;
  return { status: "running", remainingMs: state.remainingMs, endsAt: now + state.remainingMs };
}

export function pauseTimer(state: TimerState, now: number): TimerState {
  if (state.status !== "running") return state;
  return { status: "paused", remainingMs: Math.max(0, (state.endsAt ?? now) - now), endsAt: null };
}

/** Moves a running timer to "done" once its end time has passed. Other states are returned unchanged. */
export function syncTimer(state: TimerState, now: number): TimerState {
  if (state.status !== "running" || state.endsAt === null || now < state.endsAt) return state;
  return { status: "done", remainingMs: 0, endsAt: null };
}

export function remainingMs(state: TimerState, now: number): number {
  if (state.status === "running" && state.endsAt !== null) return Math.max(0, state.endsAt - now);
  return state.remainingMs;
}

/** Formats milliseconds as HH:MM:SS, rounding up so the last second shows until it ends. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** Turns hour, minute, and second fields into a total in seconds, or null when invalid. */
export function durationFromParts(hours: string, minutes: string, seconds: string): number | null {
  const parts = [hours, minutes, seconds].map((part) => (part.trim() === "" ? 0 : Number(part)));
  if (parts.some((part) => !Number.isInteger(part) || part < 0)) return null;
  const [h, m, s] = parts;
  if (m > 59 || s > 59) return null;
  const total = h * 3600 + m * 60 + s;
  if (total <= 0 || total > MAX_DURATION_SEC) return null;
  return total;
}
