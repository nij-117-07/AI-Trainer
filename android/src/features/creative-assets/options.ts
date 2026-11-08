// src/features/creative-assets/options.ts
/**
 * Task type presets for the Creative Assets form. Values match the webui options, so the field
 * does not accept custom text.
 */

export interface CreativeChoice {
  value: string;
  label: string;
}

export const TASK_TYPE_OPTIONS: CreativeChoice[] = [
  { value: "Product Names", label: "Product Names" },
  { value: "Product Titles", label: "Product Titles" },
  { value: "Hashtags", label: "Hashtags" },
  { value: "SEO Titles", label: "SEO Titles" },
  { value: "Slogans", label: "Slogans" },
  { value: "Taglines", label: "Taglines" },
  { value: "Email Subject Lines", label: "Email Subject Lines" },
];

export const TASK_TYPES = TASK_TYPE_OPTIONS.map((option) => option.value);
