// src/features/learning/memory-helper/components/results/MemoryProcessResult.tsx
/**
 * Renders the Memory Helper output as a composed Markdown document: why the
 * technique works, the concept-to-hook mappings, and the retention plan.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { MemoryResponse } from "../../types";

export function MemoryProcessResult({ result }: { result: MemoryResponse }) {
  const hooksMarkdown = result.memory_hooks
    .map((hook, index) => `### ${index + 1}. ${hook.concept}\n\n${hook.hook}`)
    .join("\n\n");

  const sections: string[] = [];
  if (result.explanation.trim()) {
    sections.push(`## Why This Technique Works\n\n${result.explanation}`);
  }
  sections.push(
    hooksMarkdown
      ? `## Memory Hooks\n\n${hooksMarkdown}`
      : "## Memory Hooks\n\n_No memory hooks returned._"
  );
  if (result.retention_plan.trim()) {
    sections.push(`## Retention Plan\n\n${result.retention_plan}`);
  }

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
      </CardContent>
    </Card>
  );
}
