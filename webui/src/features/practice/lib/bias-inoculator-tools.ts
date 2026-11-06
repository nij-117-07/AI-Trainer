// src/features/practice/lib/bias-inoculator-tools.ts
/**
 * Tool registry for the Cognitive Bias Inoculator.
 */
import type { LearningTool } from "@/features/learning/lib/learning-tools";
import { ShieldAlert } from "lucide-react";

export const biasInoculatorTools: LearningTool[] = [
  {
    id: "bias-inoculator",
    title: "Cognitive Bias Inoculator",
    shortTitle: "Bias Inoculator",
    description: "Train against cognitive biases with stealthy System 1 vs System 2 scenarios.",
    href: "/practice/bias-inoculator",
    icon: ShieldAlert,
    accent: "from-amber-500/15 to-orange-500/15 text-amber-500",
  },
];
