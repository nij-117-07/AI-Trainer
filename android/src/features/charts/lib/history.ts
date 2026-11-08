// src/features/charts/lib/history.ts
/**
 * Version history for the Chart.js Generator. Each generated chart is appended, capped at the
 * newest 20, so the user can restore an earlier version into Previous Code.
 */
import type { ChartVersion } from "../types";
import { isRecord, listOf } from "./text";

export const MAX_VERSIONS = 20;

function isVersion(value: unknown): value is ChartVersion {
  return isRecord(value) && typeof value.code === "string" && typeof value.savedAt === "string";
}

export function parseHistory(raw: unknown): ChartVersion[] {
  return listOf(raw).filter(isVersion).slice(-MAX_VERSIONS);
}

export function appendVersion(versions: ChartVersion[], code: string, savedAt: string): ChartVersion[] {
  return [...versions, { code, savedAt }].slice(-MAX_VERSIONS);
}

/** First non-empty line of the code, cut to 48 characters, for the restore list. */
export function codeSnippet(code: string): string {
  const firstLine = code.split("\n").find((line) => line.trim()) ?? "";
  const trimmed = firstLine.trim();
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
}

export function versionLabel(version: ChartVersion): string {
  const time = new Date(version.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${time} — ${codeSnippet(version.code)}`;
}
