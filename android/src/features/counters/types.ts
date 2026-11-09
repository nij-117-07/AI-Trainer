// src/features/counters/types.ts

export interface Counter {
  id: string;
  name: string;
  target: number;
  count: number;
  createdAt: string;
}

export interface Countdown {
  id: string;
  name: string;
  durationSec: number;
  createdAt: string;
}

export type CounterTab = "counter" | "countdown";

export type TimerStatus = "idle" | "running" | "paused" | "done";

export interface TimerState {
  status: TimerStatus;
  /** Time left when paused, idle, or done. Ignored while running. */
  remainingMs: number;
  /** Epoch ms when the running timer reaches zero. */
  endsAt: number | null;
}
