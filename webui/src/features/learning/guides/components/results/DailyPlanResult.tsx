// src/features/learning/guides/components/results/DailyPlanResult.tsx
/**
 * Renders the Daily Study Plan output as a composed Markdown document:
 * objective, gap analysis, structured roadmap, exercise, and resources.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { DailyPlannerResponse } from "../../types";

export function DailyPlanResult({ result }: { result: DailyPlannerResponse }) {
  const sections: string[] = [];

  if (result.learning_objective.trim()) {
    sections.push(`## Learning Objective\n\n${result.learning_objective}`);
  }
  if (result.mastery_gap_analysis.trim()) {
    sections.push(`## Mastery Gap Analysis\n\n${result.mastery_gap_analysis}`);
  }
  if (result.structured_roadmap.length > 0) {
    const roadmap = result.structured_roadmap
      .map((step, index) => `${index + 1}. ${step}`)
      .join("\n");
    sections.push(`## Structured Roadmap\n\n${roadmap}`);
  } else {
    sections.push("## Structured Roadmap\n\n_No roadmap steps returned._");
  }
  if (result.recommended_exercise.trim()) {
    sections.push(`## Recommended Exercise\n\n${result.recommended_exercise}`);
  }
  if (result.resource_suggestions.trim()) {
    sections.push(`## Resources & Suggestions\n\n${result.resource_suggestions}`);
  }

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
      </CardContent>
    </Card>
  );
}
