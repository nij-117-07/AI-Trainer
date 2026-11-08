// src/features/diagram/lib/persistence.ts
/** Storage keys and readers for the saved draft and version history. Unreadable data falls back to defaults. */
import { DEFAULT_DRAFT, DEFAULT_FORM, DIAGRAM_FORMATS } from "../options";
import type { DiagramDraft, DiagramFormat, DiagramFormValues, DiagramResult, DiagramVersion } from "../types";
import { isRecord } from "./text";

export const DIAGRAM_STORAGE_KEYS = {
  draft: "tools.diagram.generate.v2",
  history: "tools.diagram.history.v1",
} as const;

export const MAX_VERSIONS = 20;

function formatOf(value: unknown): DiagramFormat | null {
  return DIAGRAM_FORMATS.find((format) => format === value) ?? null;
}

function textField(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

export function restoreForm(saved: unknown): DiagramFormValues {
  if (!isRecord(saved)) return DEFAULT_FORM;
  return {
    format: formatOf(saved.format) ?? DEFAULT_FORM.format,
    instruction: textField(saved.instruction, DEFAULT_FORM.instruction),
    context: textField(saved.context, DEFAULT_FORM.context),
    existingMermaid: textField(saved.existingMermaid, DEFAULT_FORM.existingMermaid),
    existingDrawio: textField(saved.existingDrawio, DEFAULT_FORM.existingDrawio),
  };
}

export function restoreResult(saved: unknown): DiagramResult | null {
  if (!isRecord(saved)) return null;
  const format = formatOf(saved.format);
  if (!format || typeof saved.code !== "string") return null;
  return { message: textField(saved.message, ""), code: saved.code, format };
}

export function restoreDraft(saved: unknown): DiagramDraft {
  if (!isRecord(saved)) return DEFAULT_DRAFT;
  return {
    form: restoreForm(saved.form),
    result: restoreResult(saved.result),
    previewMermaid: textField(saved.previewMermaid, ""),
    previewDrawio: textField(saved.previewDrawio, ""),
  };
}

export function parseVersions(saved: unknown): DiagramVersion[] {
  if (!Array.isArray(saved)) return [];
  const versions: DiagramVersion[] = [];
  for (const entry of saved) {
    if (!isRecord(entry)) continue;
    const format = formatOf(entry.format);
    if (!format || typeof entry.code !== "string" || typeof entry.savedAt !== "string") continue;
    versions.push({ code: entry.code, format, savedAt: entry.savedAt });
  }
  return versions.slice(-MAX_VERSIONS);
}

export function appendVersion(versions: DiagramVersion[], entry: DiagramVersion): DiagramVersion[] {
  return [...versions, entry].slice(-MAX_VERSIONS);
}
