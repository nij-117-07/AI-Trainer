// src/features/what-to-do-now/lib/normalise.ts
/** Turns raw model output into typed values so the screen never reads an unchecked field. */
import type { NextAction, WhatToDoNowDraft, WhatToDoNowResult } from "../types";
import { listOf, asRecord, textOf } from "@/features/projects/lib/normalise";
import { EXTRA_INFO_MAX, GOALS_MAX, SITUATION_MAX } from "./validate";

function toNextAction(raw: unknown): NextAction {
  const item = asRecord(raw);
  const minutes = typeof item.minutes === "number" && Number.isFinite(item.minutes) ? Math.round(item.minutes) : null;
  return {
    action: textOf(item.action),
    goal: textOf(item.goal),
    reason: textOf(item.reason),
    minutes,
    done: item.done === true,
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

export function toWhatToDoNowDraft(raw: unknown): WhatToDoNowDraft {
  const record = asRecord(raw);
  const form = asRecord(record.form);
  const hasResult = typeof record.result === "object" && record.result !== null;
  return {
    form: {
      goals: textOf(form.goals).slice(0, GOALS_MAX),
      dateTime: textOf(form.dateTime),
      situation: textOf(form.situation).slice(0, SITUATION_MAX),
      extraInfo: textOf(form.extraInfo).slice(0, EXTRA_INFO_MAX),
    },
    result: hasResult ? toWhatToDoNowResult(record.result) : null,
  };
}
