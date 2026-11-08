// src/features/diagram/lib/validate.ts
/** Input checks for the Diagram Generator form. Limits match the webui zod schema. */
import { DIAGRAM_FORMATS } from "../options";
import type { DiagramFormat } from "../types";

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

export function optionalText(value: string, label: string, max: number): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed || undefined;
}

export function requireFormat(value: string): DiagramFormat {
  const match = DIAGRAM_FORMATS.find((format) => format === value);
  if (!match) throw new Error("Format must be Mermaid or Draw.io.");
  return match;
}
