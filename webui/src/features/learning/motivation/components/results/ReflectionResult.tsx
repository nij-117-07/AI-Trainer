// src/features/learning/motivation/components/results/ReflectionResult.tsx
/**
 * Renders the Reflection output as a composed Markdown document: the journaling
 * prompts and the perspective shift.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { ReflectionResponse } from "../../types";

export function ReflectionResult({ result }: { result: ReflectionResponse }) {
  const promptsMarkdown =
    result.prompts.length > 0
      ? result.prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join("\n")
      : "_No prompts returned._";

  const sections: string[] = [`## Journaling Prompts\n\n${promptsMarkdown}`];
  if (result.perspective_shift.trim()) {
    sections.push(`## Perspective Shift\n\n${result.perspective_shift}`);
  }

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
      </CardContent>
    </Card>
  );
}
