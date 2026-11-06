// src/features/tools/creative-assets/lib/options.ts
/**
 * Form options for the Creative Assets generator.
 */
import type { FieldOption } from "@/features/learning/explainer/components/fields";

export const taskTypeOptions: FieldOption[] = [
  { value: "Product Names", label: "Product Names" },
  { value: "Product Titles", label: "Product Titles" },
  { value: "Hashtags", label: "Hashtags" },
  { value: "SEO Titles", label: "SEO Titles" },
  { value: "Slogans", label: "Slogans" },
  { value: "Taglines", label: "Taglines" },
  { value: "Email Subject Lines", label: "Email Subject Lines" },
];
