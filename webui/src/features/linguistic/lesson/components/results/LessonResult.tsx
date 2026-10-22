// src/features/linguistic/lesson/components/results/LessonResult.tsx
/**
 * Renders the generated lesson as a composed Markdown document: the lesson
 * header, comparative analysis, deep dive, vocabulary table, practice
 * exercises, insider nuance, and homework.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { LessonResponse, VocabularyItem } from "../../types";

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function vocabularyTable(items: VocabularyItem[]): string {
  if (!items.length) return "_No vocabulary returned._";
  const rows = items.map(
    (item) =>
      `| ${item.word} | ${item.ipa} | ${item.translation} | ${item.example} |`
  );
  return [
    "| Word | IPA | Translation | Example |",
    "| --- | --- | --- | --- |",
    ...rows,
  ].join("\n");
}

export function LessonResult({ result }: { result: LessonResponse }) {
  const sections: string[] = [];
  if (result.header.trim()) {
    sections.push(`# ${result.header.trim()}`);
  }
  if (result.comparative_analysis.trim()) {
    sections.push(`## Comparative Analysis\n\n${result.comparative_analysis.trim()}`);
  }
  if (result.deep_dive.trim()) {
    sections.push(`## Deep Dive\n\n${result.deep_dive.trim()}`);
  }
  sections.push(`## Vocabulary\n\n${vocabularyTable(result.vocabulary)}`);
  sections.push(
    result.practice.length
      ? `## Practice\n\n${bulletList(result.practice)}`
      : "## Practice\n\n_No exercises returned._"
  );
  if (result.nuance.trim()) {
    sections.push(`## Insider Nuance\n\n${result.nuance.trim()}`);
  }
  if (result.homework.trim()) {
    sections.push(`## Homework\n\n${result.homework.trim()}`);
  }

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
      </CardContent>
    </Card>
  );
}
