// src/features/learning/memory-helper/lib/options.ts
/**
 * Label/value option sets for the Memory Helper form fields.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const techniqueOptions: FieldOption[] = [
  { value: "Best Fit", label: "Best Fit" },
  { value: "Method of Loci", label: "Method of Loci" },
  { value: "Peg Words", label: "Peg Words" },
  { value: "Acronyms", label: "Acronyms" },
  { value: "Chunking", label: "Chunking" },
  { value: "Storytelling", label: "Storytelling" },
  { value: "Keyword Method", label: "Keyword Method" },
];
