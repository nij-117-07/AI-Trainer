// src/features/learning/motivation/components/results/MotivationQuoteResult.tsx
/**
 * Renders the Motivational Quote output as a composed Markdown document: the
 * quote blockquote, attribution, and the actionable micro-insight.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { MotivationResponse } from "../../types";

export function MotivationQuoteResult({ result }: { result: MotivationResponse }) {
  const sections: string[] = [];

  if (result.quote.trim()) {
    const attribution: string[] = [];
    if (result.author_persona.trim()) attribution.push(`— **${result.author_persona}**`);
    if (result.current_date?.trim()) attribution.push(`*${result.current_date}*`);
    const attributionLine = attribution.length ? `\n\n${attribution.join("  \n")}` : "";
    sections.push(`## Your Quote\n\n> ${result.quote}${attributionLine}`);
  }
  if (result.actionable_insight.trim()) {
    sections.push(`## Actionable Insight\n\n${result.actionable_insight}`);
  }

  return (
    <Card>
      <CardContent className="p-5">
        <MarkdownContent content={sections.join("\n\n---\n\n")} />
      </CardContent>
    </Card>
  );
}
