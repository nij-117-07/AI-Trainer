// src/features/resource-suggestor/options.ts
/** Dropdown presets for the Resource Suggestor. Values match the resource types the model returns. */
import type { SelectOption } from "@/components/tool/SelectField";

export const ANY_RESOURCE_TYPE = "any";

export const RESOURCE_TYPE_OPTIONS: SelectOption[] = [
  { value: ANY_RESOURCE_TYPE, label: "Any type" },
  { value: "book", label: "Book" },
  { value: "youtube_video", label: "YouTube video" },
  { value: "blog_post", label: "Blog post" },
  { value: "online_course", label: "Online course" },
  { value: "documentation", label: "Documentation" },
  { value: "podcast", label: "Podcast" },
  { value: "github_repo", label: "GitHub repo" },
  { value: "paper", label: "Paper" },
];

export function isResourceType(value: unknown): value is string {
  return typeof value === "string" && RESOURCE_TYPE_OPTIONS.some((option) => option.value === value);
}

export function resourceTypeLabel(value: string): string {
  return RESOURCE_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? "Any type";
}
