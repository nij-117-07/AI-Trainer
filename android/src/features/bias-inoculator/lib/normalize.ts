// src/features/bias-inoculator/lib/normalize.ts
/** Turns raw model output into the scenario the screen renders. Missing fields become empty text. */
import type { BiasScenario, TargetBias } from "../types";

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeScenario(
  raw: { scenarioSetup?: unknown; intuitiveTrap?: unknown; rationalAnalysis?: unknown; realWorldApplication?: unknown },
  targetBias: TargetBias,
): BiasScenario {
  return {
    targetBias,
    scenarioSetup: textOf(raw.scenarioSetup),
    intuitiveTrap: textOf(raw.intuitiveTrap),
    rationalAnalysis: textOf(raw.rationalAnalysis),
    realWorldApplication: textOf(raw.realWorldApplication),
  };
}
