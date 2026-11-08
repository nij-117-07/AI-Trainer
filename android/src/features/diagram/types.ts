// src/features/diagram/types.ts

export type DiagramFormat = "mermaid" | "drawio";

export interface DiagramFormValues {
  format: DiagramFormat;
  instruction: string;
  context: string;
  existingMermaid: string;
  existingDrawio: string;
}

export interface DiagramResult {
  message: string;
  code: string;
  format: DiagramFormat;
}

export interface DiagramVersion {
  code: string;
  format: DiagramFormat;
  savedAt: string;
}

export interface DiagramDraft {
  form: DiagramFormValues;
  result: DiagramResult | null;
  previewMermaid: string;
  previewDrawio: string;
}
