// src/features/tools/lib/vision-converter-tools.ts
/**
 * Tool registry for Vision Converter.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { FileImage } from "lucide-react";

export const visionConverterTools: LearningTool[] = [
  {
    id: "vision-converter",
    title: "Vision Converter",
    shortTitle: "Vision Converter",
    description: "Convert an uploaded image into high-quality, well-structured Markdown.",
    href: "/tools/vision",
    icon: FileImage,
    accent: "from-violet-500/15 to-purple-500/15 text-violet-500",
  },
];
