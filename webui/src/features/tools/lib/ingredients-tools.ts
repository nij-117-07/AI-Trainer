// src/features/tools/lib/ingredients-tools.ts
/**
 * Tool registry for Ingredients Checker.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { Apple } from "lucide-react";

export const ingredientsTools: LearningTool[] = [
  {
    id: "ingredients",
    title: "Ingredients Checker",
    shortTitle: "Ingredients",
    description: "Snap a photo of a product's ingredients list for a nutritional health analysis.",
    href: "/tools/ingredients",
    icon: Apple,
    accent: "from-green-500/15 to-lime-500/15 text-green-500",
  },
];
