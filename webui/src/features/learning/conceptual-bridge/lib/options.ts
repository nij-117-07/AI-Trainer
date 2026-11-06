// src/features/learning/conceptual-bridge/lib/options.ts
/**
 * Form options for the Conceptual Bridge Builder.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const abstractionDepthOptions: FieldOption[] = [
  { value: "surface", label: "Surface" },
  { value: "structural", label: "Structural" },
  { value: "systemic", label: "Systemic" },
];
