// src/features/learning/guides/components/results/GuideTaskResult.tsx
/**
 * Renders the Guide Tasks output as a single composed Markdown document:
 * mentor feedback plus a numbered list of actionable tasks.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { GuideResponse } from "../../types";

export function GuideTaskResult({ result }: { result: GuideResponse }) {
  const tasksMarkdown = result.tasks
    .map((task, index) => {
      const meta: string[] = [];
      if (task.difficulty) meta.push(`**Difficulty:** ${task.difficulty}`);
      if (typeof task.estimated_hours === "number") {
        meta.push(`**Estimated:** ${task.estimated_hours}h`);
      }
      const outcomes = task.learning_outcomes.length
        ? `\n\n**Learning outcomes:** ${task.learning_outcomes.join(", ")}`
        : "";
      return `### ${index + 1}. ${task.title}\n\n${meta.join(" · ")}\n\n${task.description}${outcomes}`;
    })
    .join("\n\n");

  const sections: string[] = [];
  if (result.mentor_feedback.trim()) {
    sections.push(`## Mentor Feedback\n\n${result.mentor_feedback}`);
  }
  if (tasksMarkdown) {
    sections.push(`## Your Tasks\n\n${tasksMarkdown}`);
  }

  return (
    <Card>
      <CardContent className="p-5">
        {sections.length > 0 ? (
          <MarkdownContent content={sections.join("\n\n---\n\n")} />
        ) : (
          <p className="text-sm text-muted-foreground">No tasks were generated.</p>
        )}
      </CardContent>
    </Card>
  );
}
