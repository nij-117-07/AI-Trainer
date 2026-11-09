// src/features/what-to-do-now/lib/normalise.ts
/** Turns raw model output into typed values so the screen never reads an unchecked field. */
import type { NextAction, WhatToDoNowResult } from "../types";
import { listOf, asRecord, textOf } from "@/features/projects/lib/normalise";

function toNextAction(raw: unknown): NextAction {
  const item = asRecord(raw);
  const minutes = typeof item.minutes === "number" && Number.isFinite(item.minutes) ? Math.round(item.minutes) : null;
  return {
    action: textOf(item.action),
    goal: textOf(item.goal),
    reason: textOf(item.reason),
    minutes,
  };
}

export function toWhatToDoNowResult(raw: unknown): WhatToDoNowResult {
  const record = asRecord(raw);
  return {
    timeContext: textOf(record.timeContext),
    doNow: listOf(record.doNow as unknown[]).map(toNextAction).filter((item) => item.action.trim() !== ""),
    avoid: listOf(record.avoid as unknown[]).map(textOf).filter((item) => item.trim() !== ""),
    nextCheckpoint: textOf(record.nextCheckpoint),
  };
}
