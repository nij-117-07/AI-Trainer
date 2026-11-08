// src/features/diagram/options.ts
/** Format choices, input limits from the webui zod schema, and the starting form for the Diagram Generator. */
import type { DiagramDraft, DiagramFormat, DiagramFormValues } from "./types";

export const DIAGRAM_FORMATS: readonly DiagramFormat[] = ["mermaid", "drawio"];

export const DIAGRAM_FORMAT_OPTIONS: { value: DiagramFormat; label: string }[] = [
  { value: "mermaid", label: "Mermaid" },
  { value: "drawio", label: "Draw.io" },
];

export const INSTRUCTION_MAX = 2000;
export const CONTEXT_MAX = 2000;
export const EXISTING_CODE_MAX = 20000;

export const DEFAULT_FORM: DiagramFormValues = {
  format: "mermaid",
  instruction: "Flowchart of the login flow",
  context: "User enters credentials, the system validates them, then routes to dashboard or shows an error.",
  existingMermaid: "",
  existingDrawio: "",
};

export const DEFAULT_DRAFT: DiagramDraft = {
  form: DEFAULT_FORM,
  result: null,
  previewMermaid: "",
  previewDrawio: "",
};

export function formatLabel(format: DiagramFormat): string {
  return format === "mermaid" ? "Mermaid" : "Draw.io";
}
