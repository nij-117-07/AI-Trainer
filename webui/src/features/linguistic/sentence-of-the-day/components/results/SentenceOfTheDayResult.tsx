// src/features/linguistic/sentence-of-the-day/components/results/SentenceOfTheDayResult.tsx
/**
 * Renders the Sentence of the Day output as a composed Markdown document: the
 * featured sentence with its translations, grammar, cultural context, and
 * substitution options.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { SentenceResponse } from "../../types";

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

export function SentenceOfTheDayResult({ result }: { result: SentenceResponse }) {
  const header: string[] = [`# ${result.target_sentence}`];
  if (result.natural_translation.trim()) {
    header.push(`*${result.natural_translation.trim()}*`);
  }

  const sections: string[] = [header.join("\n\n")];
  if (result.literal_translation.trim()) {
    sections.push(`**Literal translation:** ${result.literal_translation.trim()}`);
  }
  if (result.grammatical_highlight.trim()) {
    sections.push(`## Grammatical Highlight\n\n${result.grammatical_highlight.trim()}`);
  }
  if (result.cultural_context.trim()) {
    sections.push(`## Cultural Context\n\n${result.cultural_context.trim()}`);
  }
  sections.push(
    result.substitution_options.length
      ? `## Try These Variations\n\n${bulletList(result.substitution_options)}`
      : "## Try These Variations\n\n_No variations returned._"
  );

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
        {result.date && (
          <p className="mt-6 border-t pt-4 text-xs text-muted-foreground">
            Featured on {result.date}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
