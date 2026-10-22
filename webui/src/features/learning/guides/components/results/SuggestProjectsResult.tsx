// src/features/learning/guides/components/results/SuggestProjectsResult.tsx
/**
 * Renders the project use-case suggestions as a composed Markdown document:
 * the brief strategy plus each project with its problem and key features.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { ProjectSuggestorResponse } from "../../types";

export function SuggestProjectsResult({ result }: { result: ProjectSuggestorResponse }) {
  const projectsMarkdown = result.projects
    .map((project, index) => {
      const features = project.key_features.length
        ? `\n\n**Key features:**\n${project.key_features.map((feature) => `- ${feature}`).join("\n")}`
        : "";
      return `### ${index + 1}. ${project.title}\n\n${project.problem}${features}`;
    })
    .join("\n\n");

  const sections: string[] = [];
  if (result.brief_strategy.trim()) {
    sections.push(`## Strategy\n\n${result.brief_strategy}`);
  }
  sections.push(projectsMarkdown ? `## Project Use Cases\n\n${projectsMarkdown}` : "## Project Use Cases\n\n_No projects returned._");

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
      </CardContent>
    </Card>
  );
}
