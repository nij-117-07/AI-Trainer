// src/features/pareto-topics/lib/coverage.ts
import type { ParetoTopic } from "../types";

/** Adds up the rough work shares. Null when no topic has an estimate. The total is capped at 100. */
export function coverageOf(topics: ParetoTopic[]): number | null {
  const shares = topics.flatMap((topic) => (topic.workShare === null ? [] : [topic.workShare]));
  if (shares.length === 0) return null;
  return Math.min(100, Math.round(shares.reduce((sum, share) => sum + share, 0)));
}
