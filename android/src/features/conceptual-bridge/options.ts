// src/features/conceptual-bridge/options.ts
/** Abstraction depth choices. Values match the backend AbstractionDepth literal. */
import type { AbstractionDepth } from "./types";

export const abstractionDepthOptions: { value: AbstractionDepth; label: string }[] = [
  { value: "surface", label: "Surface" },
  { value: "structural", label: "Structural" },
  { value: "systemic", label: "Systemic" },
];
