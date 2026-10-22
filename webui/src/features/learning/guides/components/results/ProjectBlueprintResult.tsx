// src/features/learning/guides/components/results/ProjectBlueprintResult.tsx
/**
 * Renders the Project Blueprint output as a composed Markdown document: the
 * project name, industry context, problem statement, requirements, stretch
 * goals, and validation criteria.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { ProjectArchitectResponse } from "../../types";

export function ProjectBlueprintResult({ result }: { result: ProjectArchitectResponse }) {
  const sections: string[] = [];

  const meta: string[] = [];
  if (result.industry_context.trim()) meta.push(`**Industry:** ${result.industry_context}`);
  if (result.random_seed?.trim()) meta.push(`**Build seed:** \`${result.random_seed}\``);

  if (result.project_name.trim()) {
    sections.push(
      `# ${result.project_name}${meta.length ? `\n\n${meta.join(" · ")}` : ""}`
    );
  }
  if (result.problem_statement.trim()) {
    sections.push(`## Problem Statement\n\n${result.problem_statement}`);
  }
  if (result.technical_requirements.length > 0) {
    const requirements = result.technical_requirements
      .map((item) => `- ${item}`)
      .join("\n");
    sections.push(`## Technical Requirements\n\n${requirements}`);
  }
  if (result.stretch_goals.length > 0) {
    const goals = result.stretch_goals.map((goal) => `- ${goal}`).join("\n");
    sections.push(`## Stretch Goals\n\n${goals}`);
  }
  if (result.validation_criteria.trim()) {
    sections.push(`## Validation Criteria\n\n${result.validation_criteria}`);
  }

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
      </CardContent>
    </Card>
  );
}
